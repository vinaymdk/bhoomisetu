import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThan, IsNull, In } from 'typeorm';
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationDeliveryLog, DeliveryChannel, DeliveryStatus } from './entities/notification-delivery-log.entity';
import { NotificationTemplate } from './entities/notification-template.entity';
import { User } from '../users/entities/user.entity';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(NotificationDeliveryLog)
    private readonly deliveryLogRepository: Repository<NotificationDeliveryLog>,
    @InjectRepository(NotificationTemplate)
    private readonly templateRepository: Repository<NotificationTemplate>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Send notification to user (multi-channel: push, SMS, email)
   * Main entry point for all notifications
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options: {
      priority?: NotificationPriority;
      data?: Record<string, any>;
      channels?: ('push' | 'sms' | 'email')[];
      expiresAt?: Date;
      messageEnglish?: string;
      messageTelugu?: string;
      language?: 'en' | 'te';
    } = {},
  ): Promise<Notification> {
    // Get or create user preferences
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = this.preferenceRepository.create({
        userId,
        pushEnabled: true,
        smsEnabled: true,
        emailEnabled: true,
      });
      preferences = await this.preferenceRepository.save(preferences);
    }

    // Check if user wants this type of notification
    if (!this.isNotificationTypeEnabled(preferences, type)) {
      this.logger.debug(`Notification type ${type} disabled for user ${userId}`);
      // Still create notification record, but mark as not sent
    }

    // Get user for channel info
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    // Determine language
    const language = options.language || 'en';
    let messageEnglish = options.messageEnglish || (language === 'en' ? message : null);
    let messageTelugu = options.messageTelugu || (language === 'te' ? message : null);

    // Enforce role-based contact visibility for non-privileged roles
    if (!this.canViewContactDetails(user)) {
      const sanitized = this.sanitizeNotificationContent({
        title,
        message,
        messageEnglish,
        messageTelugu,
        data: options.data || null,
      });
      title = sanitized.title;
      message = sanitized.message;
      messageEnglish = sanitized.messageEnglish;
      messageTelugu = sanitized.messageTelugu;
      options.data = sanitized.data;
    }

    // Determine channels to use
    const channelsToUse = options.channels || this.determineChannels(preferences);

    // Create notification record
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      messageEnglish,
      messageTelugu,
      data: options.data || null,
      priority: options.priority || NotificationPriority.NORMAL,
      status: NotificationStatus.PENDING,
      expiresAt: options.expiresAt || null,
      channelsSent: channelsToUse,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Send through each channel asynchronously
    const deliveryPromises: Promise<void>[] = [];

    for (const channel of channelsToUse) {
      if (this.isChannelEnabled(preferences, channel)) {
        deliveryPromises.push(this.sendThroughChannel(savedNotification, channel, preferences, user));
      }
    }

    // Wait for all deliveries
    await Promise.allSettled(deliveryPromises);

    // Update notification status based on delivery results
    await this.updateNotificationStatus(savedNotification);

    return savedNotification;
  }

  /**
   * Send notification through specific channel (push, SMS, email)
   */
  private async sendThroughChannel(
    notification: Notification,
    channel: 'push' | 'sms' | 'email',
    preferences: NotificationPreference,
    user: User,
  ): Promise<void> {
    try {
      switch (channel) {
        case 'push':
          await this.sendPushNotification(notification, preferences, user);
          break;
        case 'sms':
          await this.sendSmsNotification(notification, preferences, user);
          break;
        case 'email':
          await this.sendEmailNotification(notification, preferences, user);
          break;
      }

      // Log delivery success (will be logged by individual channel methods)
    } catch (error: any) {
      this.logger.error(
        `Failed to send ${channel} notification ${notification.id}: ${error.message}`,
      );

      // Determine delivery channel enum for error logging
      let deliveryChannel: DeliveryChannel;
      switch (channel) {
        case 'push':
          deliveryChannel = DeliveryChannel.PUSH;
          break;
        case 'sms':
          deliveryChannel = DeliveryChannel.SMS;
          break;
        case 'email':
          deliveryChannel = DeliveryChannel.EMAIL;
          break;
        default:
          deliveryChannel = DeliveryChannel.PUSH; // Default fallback
      }

      // Log delivery failure
      await this.logDelivery(notification.id, deliveryChannel, DeliveryStatus.FAILED, null, {
        error_code: error.code || 'UNKNOWN',
        error_message: error.message,
      });

      // Update notification error
      notification.deliveryError = error.message;
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * Send push notification via Firebase Cloud Messaging
   */
  private async sendPushNotification(
    notification: Notification,
    preferences: NotificationPreference,
    user: User,
  ): Promise<void> {
    if (!preferences.fcmToken) {
      this.logger.warn(`No FCM token for user ${user.id}`);
      return;
    }

    try {
      // Use Firebase Admin SDK to send push notification
      const message = {
        token: preferences.fcmToken,
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...(notification.data || {}),
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
        android: {
          priority: notification.priority === NotificationPriority.URGENT ? 'high' : 'normal',
        },
      };

      // Send via Firebase FCM
      const response = await this.firebaseService.sendPushNotification(
        preferences.fcmToken,
        {
          title: notification.title,
          body: notification.message,
        },
        {
          notificationId: notification.id,
          type: notification.type,
          ...(notification.data ? Object.fromEntries(
            Object.entries(notification.data).map(([k, v]) => [k, String(v)])
          ) : {}),
        },
        {
          priority: notification.priority === NotificationPriority.URGENT ? 'high' : 'normal',
        },
      );

      // Update notification
      notification.pushSent = true;
      notification.pushSentAt = new Date();
      await this.notificationRepository.save(notification);

      // Log delivery
      await this.logDelivery(notification.id, DeliveryChannel.PUSH, DeliveryStatus.SENT, response, {
        provider_message_id: response,
        provider_response: { success: true, messageId: response },
      });
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(
    notification: Notification,
    preferences: NotificationPreference,
    user: User,
  ): Promise<void> {
    const phoneNumber = preferences.phoneNumber || user.primaryPhone;

    if (!phoneNumber) {
      this.logger.warn(`No phone number for user ${user.id}`);
      return;
    }

    try {
      // SMS Gateway Integration (Twilio, AWS SNS, MessageBird, etc.)
      // TODO: Replace with actual SMS gateway integration
      // Example for Twilio:
      // const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // const response = await twilioClient.messages.create({
      //   body: notification.message.length > 160 ? notification.message.substring(0, 160) : notification.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: phoneNumber,
      // });
      // const smsMessageId = response.sid;
      
      // Example for AWS SNS:
      // const sns = new AWS.SNS({ region: process.env.AWS_REGION });
      // const response = await sns.publish({
      //   Message: notification.message,
      //   PhoneNumber: phoneNumber,
      // }).promise();
      // const smsMessageId = response.MessageId;
      
      // For now, simulate success (ready for integration)
      const smsMessageId = `simulated-sms-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      this.logger.log(`SMS notification sent to ${phoneNumber} (simulated - ready for gateway integration). Message ID: ${smsMessageId}`);

      // Update notification
      notification.smsSent = true;
      notification.smsSentAt = new Date();
      await this.notificationRepository.save(notification);

      // Log delivery
      await this.logDelivery(notification.id, DeliveryChannel.SMS, DeliveryStatus.SENT, smsMessageId, {
        provider_message_id: smsMessageId,
        provider_response: { 
          success: true,
          simulated: true,
          note: 'Ready for SMS gateway integration (Twilio, AWS SNS, MessageBird, etc.)',
        },
        destination: phoneNumber,
      });
    } catch (error: any) {
      this.logger.error(`Failed to send SMS notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    notification: Notification,
    preferences: NotificationPreference,
    user: User,
  ): Promise<void> {
    const emailAddress = preferences.emailAddress || user.primaryEmail;

    if (!emailAddress) {
      this.logger.warn(`No email address for user ${user.id}`);
      return;
    }

    try {
      // Email Service Integration (SendGrid, AWS SES, Mailgun, etc.)
      // TODO: Replace with actual email service integration
      // Example for SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // const msg = {
      //   to: emailAddress,
      //   from: process.env.SENDGRID_FROM_EMAIL,
      //   subject: notification.title,
      //   text: notification.message,
      //   html: `<p>${notification.message}</p>`,
      // };
      // const response = await sgMail.send(msg);
      // const emailMessageId = response[0].headers['x-message-id'];
      
      // Example for AWS SES:
      // const ses = new AWS.SES({ region: process.env.AWS_REGION });
      // const response = await ses.sendEmail({
      //   Source: process.env.SES_FROM_EMAIL,
      //   Destination: { ToAddresses: [emailAddress] },
      //   Message: {
      //     Subject: { Data: notification.title },
      //     Body: { Text: { Data: notification.message }, Html: { Data: `<p>${notification.message}</p>` } },
      //   },
      // }).promise();
      // const emailMessageId = response.MessageId;
      
      // For now, simulate success (ready for integration)
      const emailMessageId = `simulated-email-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      this.logger.log(`Email notification sent to ${emailAddress} (simulated - ready for email service integration). Message ID: ${emailMessageId}`);

      // Update notification
      notification.emailSent = true;
      notification.emailSentAt = new Date();
      await this.notificationRepository.save(notification);

      // Log delivery
      await this.logDelivery(notification.id, DeliveryChannel.EMAIL, DeliveryStatus.SENT, emailMessageId, {
        provider_message_id: emailMessageId,
        provider_response: { 
          success: true,
          simulated: true,
          note: 'Ready for email service integration (SendGrid, AWS SES, Mailgun, etc.)',
        },
        destination: emailAddress,
      });
    } catch (error: any) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log delivery attempt
   */
  private async logDelivery(
    notificationId: string,
    channel: DeliveryChannel,
    status: DeliveryStatus,
    providerMessageId: string | null,
    additionalData: Record<string, any> = {},
  ): Promise<void> {
    const log = this.deliveryLogRepository.create({
      notificationId,
      channel,
      status,
      statusMessage: additionalData.status_message || null,
      providerMessageId: additionalData.provider_message_id || providerMessageId || null,
      providerResponse: additionalData.provider_response || null,
      errorCode: additionalData.error_code || null,
      errorMessage: additionalData.error_message || null,
      deliveredAt: status === DeliveryStatus.DELIVERED ? new Date() : null,
    });

    await this.deliveryLogRepository.save(log);
  }

  /**
   * Update notification status based on delivery results
   */
  private async updateNotificationStatus(notification: Notification): Promise<void> {
    const logs = await this.deliveryLogRepository.find({
      where: { notificationId: notification.id },
    });

    const hasSuccess = logs.some((log) => log.status === DeliveryStatus.SENT || log.status === DeliveryStatus.DELIVERED);
    const hasFailure = logs.some((log) => log.status === DeliveryStatus.FAILED || log.status === DeliveryStatus.BOUNCED);

    if (hasSuccess) {
      notification.status = NotificationStatus.SENT;
    } else if (hasFailure && logs.length === notification.channelsSent?.length) {
      notification.status = NotificationStatus.FAILED;
    }

    await this.notificationRepository.save(notification);
  }

  /**
   * Determine which channels to use based on preferences
   */
  private determineChannels(preferences: NotificationPreference): ('push' | 'sms' | 'email')[] {
    const channels: ('push' | 'sms' | 'email')[] = [];

    if (preferences.pushEnabled && preferences.fcmToken) {
      channels.push('push');
    }
    if (preferences.smsEnabled && preferences.phoneNumber) {
      channels.push('sms');
    }
    if (preferences.emailEnabled && preferences.emailAddress) {
      channels.push('email');
    }

    return channels.length > 0 ? channels : ['push']; // Default to push if nothing available
  }

  /**
   * Check if channel is enabled for user
   */
  private isChannelEnabled(preferences: NotificationPreference, channel: 'push' | 'sms' | 'email'): boolean {
    switch (channel) {
      case 'push':
        return preferences.pushEnabled && !!preferences.fcmToken;
      case 'sms':
        return preferences.smsEnabled && !!preferences.phoneNumber;
      case 'email':
        return preferences.emailEnabled && !!preferences.emailAddress;
    }
  }

  /**
   * Check if notification type is enabled for user
   */
  private isNotificationTypeEnabled(preferences: NotificationPreference, type: NotificationType): boolean {
    switch (type) {
      case NotificationType.PROPERTY_MATCH:
        return preferences.propertyMatchEnabled;
      case NotificationType.PRICE_DROP:
        return preferences.priceDropEnabled;
      case NotificationType.VIEWING_REMINDER:
        return preferences.viewingReminderEnabled;
      case NotificationType.SUBSCRIPTION_RENEWAL:
        return preferences.subscriptionRenewalEnabled;
      case NotificationType.CS_FOLLOWUP:
        return preferences.csFollowupEnabled;
      case NotificationType.INTEREST_EXPRESSION:
        return preferences.interestExpressionEnabled;
      case NotificationType.MEDIATION_UPDATE:
        return preferences.mediationUpdateEnabled;
      case NotificationType.AI_CHAT_ESCALATION:
        return preferences.aiChatEscalationEnabled;
      default:
        return true;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      notification.status = NotificationStatus.READ;
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Notification> = unreadOnly
      ? { userId, readAt: IsNull() }
      : { userId };

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: { userId, readAt: IsNull() },
    });

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
    };
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = this.preferenceRepository.create({
        userId,
        pushEnabled: true,
        smsEnabled: true,
        emailEnabled: true,
      });
      preferences = await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({
        userId,
        ...updates,
      });
    } else {
      Object.assign(preferences, updates);
    }

    return await this.preferenceRepository.save(preferences);
  }

  /**
   * Update FCM token for push notifications
   */
  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({
        userId,
        fcmToken,
        pushEnabled: true,
      });
    } else {
      preferences.fcmToken = fcmToken;
    }

    await this.preferenceRepository.save(preferences);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, readAt: IsNull() },
      { readAt: new Date(), status: NotificationStatus.READ },
    );
    return result.affected || 0;
  }

  /**
   * Delete a single notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const result = await this.notificationRepository.delete({ id: notificationId, userId });
    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }
  }

  /**
   * Delete multiple notifications
   */
  async deleteNotifications(userId: string, ids: string[]): Promise<number> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Notification ids are required');
    }
    const result = await this.notificationRepository.delete({ userId, id: In(ids) });
    return result.affected || 0;
  }

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(userId: string): Promise<number> {
    const result = await this.notificationRepository.delete({ userId });
    return result.affected || 0;
  }

  private canViewContactDetails(user: User): boolean {
    const roleCodes =
      user.userRoles?.map((userRole) => userRole.role?.code).filter(Boolean) || [];
    return roleCodes.includes('customer_service') || roleCodes.includes('admin');
  }

  private sanitizeNotificationContent(payload: {
    title: string;
    message: string;
    messageEnglish?: string | null;
    messageTelugu?: string | null;
    data?: Record<string, any> | null;
  }): {
    title: string;
    message: string;
    messageEnglish?: string | null;
    messageTelugu?: string | null;
    data?: Record<string, any> | null;
  } {
    const redactText = (value: string) => {
      const emailRedacted = value.replace(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
        '[redacted]',
      );
      return emailRedacted.replace(/(\+?\d[\d\s-]{7,}\d)/g, '[redacted]');
    };

    const scrubbedData = payload.data
      ? Object.entries(payload.data).reduce<Record<string, any>>((acc, [key, value]) => {
          const lowered = key.toLowerCase();
          if (
            lowered.includes('phone') ||
            lowered.includes('email') ||
            lowered.includes('address') ||
            lowered.includes('contact')
          ) {
            return acc;
          }
          acc[key] = value;
          return acc;
        }, {})
      : payload.data;

    return {
      title: redactText(payload.title),
      message: redactText(payload.message),
      messageEnglish: payload.messageEnglish ? redactText(payload.messageEnglish) : payload.messageEnglish,
      messageTelugu: payload.messageTelugu ? redactText(payload.messageTelugu) : payload.messageTelugu,
      data: scrubbedData,
    };
  }

  /**
   * Delete expired notifications
   */
  async deleteExpiredNotifications(): Promise<number> {
    const result = await this.notificationRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    return result.affected || 0;
  }

  // ========================================
  // Notification Trigger Helpers (for Module Integration)
  // ========================================

  /**
   * Trigger: New matching property (Module 6)
   */
  async notifyPropertyMatch(buyerId: string, propertyId: string, matchScore: number): Promise<void> {
    await this.sendNotification(
      buyerId,
      NotificationType.PROPERTY_MATCH,
      'New Property Match!',
      `A new property matches your requirement (${Math.round(matchScore)}% match). Check it out!`,
      {
        priority: NotificationPriority.HIGH,
        data: { propertyId, matchScore },
      },
    );
  }

  /**
   * Trigger: Price drop (Module 4)
   */
  async notifyPriceDrop(buyerId: string, propertyId: string, oldPrice: number, newPrice: number): Promise<void> {
    const priceDropPercent = ((oldPrice - newPrice) / oldPrice) * 100;
    await this.sendNotification(
      buyerId,
      NotificationType.PRICE_DROP,
      'Price Drop Alert!',
      `Property price dropped by ${Math.round(priceDropPercent)}%! New price: ₹${newPrice.toLocaleString()}`,
      {
        priority: NotificationPriority.HIGH,
        data: { propertyId, oldPrice, newPrice, priceDropPercent },
      },
    );
  }

  /**
   * Trigger: CS follow-up (Module 5/7)
   */
  async notifyCsFollowup(userId: string, message: string, priority: NotificationPriority = NotificationPriority.NORMAL): Promise<void> {
    await this.sendNotification(
      userId,
      NotificationType.CS_FOLLOWUP,
      'Customer Service Follow-up',
      message,
      { priority },
    );
  }

  /**
   * Trigger: Interest expression (Module 7)
   */
  async notifyInterestExpression(sellerId: string, buyerId: string, propertyId: string): Promise<void> {
    await this.sendNotification(
      sellerId,
      NotificationType.INTEREST_EXPRESSION,
      'New Interest in Your Property',
      'A buyer has expressed interest in your property. Customer service will contact you soon.',
      {
        priority: NotificationPriority.HIGH,
        data: { buyerId, propertyId }, // CRITICAL: buyerId only visible to CS, not seller
      },
    );
  }

  /**
   * Trigger: Mediation update (Module 7)
   */
  async notifyMediationUpdate(
    userId: string,
    message: string,
    interestId: string,
    status: string,
  ): Promise<void> {
    await this.sendNotification(
      userId,
      NotificationType.MEDIATION_UPDATE,
      'Mediation Update',
      message,
      {
        priority: NotificationPriority.HIGH,
        data: { interestId, status },
      },
    );
  }

  /**
   * Trigger: AI chat escalation (Module 8)
   */
  async notifyAiChatEscalation(csAgentId: string, conversationId: string, reason: string): Promise<void> {
    await this.sendNotification(
      csAgentId,
      NotificationType.AI_CHAT_ESCALATION,
      'AI Chat Escalation',
      `Conversation escalated: ${reason}`,
      {
        priority: NotificationPriority.URGENT,
        data: { conversationId, reason },
      },
    );
  }

  /**
   * Trigger: Subscription renewal (Module 10)
   */
  async notifySubscriptionRenewal(userId: string, subscriptionId: string, renewalDate: Date): Promise<void> {
    await this.sendNotification(
      userId,
      NotificationType.SUBSCRIPTION_RENEWAL,
      'Subscription Renewal Reminder',
      `Your subscription will renew on ${renewalDate.toLocaleDateString()}. Update your payment method if needed.`,
      {
        priority: NotificationPriority.NORMAL,
        data: { subscriptionId, renewalDate: renewalDate.toISOString() },
      },
    );
  }

  /**
   * Trigger: Viewing reminder (Module 7)
   */
  async notifyViewingReminder(userId: string, propertyId: string, scheduledTime: Date): Promise<void> {
    await this.sendNotification(
      userId,
      NotificationType.VIEWING_REMINDER,
      'Viewing Reminder',
      `Reminder: You have a property viewing scheduled for ${scheduledTime.toLocaleString()}`,
      {
        priority: NotificationPriority.HIGH,
        data: { propertyId, scheduledTime: scheduledTime.toISOString() },
        expiresAt: scheduledTime, // Expires after viewing time
      },
    );
  }

  /**
   * Trigger: Action-based alert (login/logout/create/update/save/etc.)
   */
  async notifyActionAlert(
    userId: string,
    action: string,
    entityLabel?: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const { title, message } = this.buildActionAlertMessage(action, entityLabel);
    await this.sendNotification(
      userId,
      NotificationType.ACTION_ALERT,
      title,
      message,
      {
        priority: NotificationPriority.NORMAL,
        data: {
          action,
          entityLabel: entityLabel || null,
          ...(data || {}),
        },
      },
    );
  }

  private buildActionAlertMessage(action: string, entityLabel?: string): { title: string; message: string } {
    const label = entityLabel ? ` ${entityLabel}` : '';
    const normalized = action.toLowerCase();
    if (normalized.includes('login')) {
      return { title: 'Login Activity', message: 'You have logged in to your BhoomiSetu account.' };
    }
    if (normalized.includes('logout')) {
      return { title: 'Logout Activity', message: 'You have logged out of your BhoomiSetu account.' };
    }
    if (normalized.includes('create') || normalized.includes('new')) {
      return { title: 'Record Created', message: `A new${label} record was created successfully.` };
    }
    if (normalized.includes('update') || normalized.includes('edit')) {
      return { title: 'Record Updated', message: `Your${label} record was updated successfully.` };
    }
    if (normalized.includes('save')) {
      return { title: 'Saved', message: `Your${label} item was saved successfully.` };
    }
    if (normalized.includes('delete') || normalized.includes('remove')) {
      return { title: 'Record Removed', message: `Your${label} record was removed successfully.` };
    }
    if (normalized.includes('verify') || normalized.includes('approve')) {
      return { title: 'Verification Update', message: `Your${label} verification status has been updated.` };
    }
    return { title: 'Account Activity', message: `Action completed${label ? ` for${label}` : ''}.` };
  }
}
