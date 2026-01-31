import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { NotificationPreference } from './entities/notification-preference.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get user notifications
   * GET /api/notifications
   */
  @Get()
  getUserNotifications(
    @CurrentUser() currentUser: CurrentUserData,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('unreadOnly') unreadOnly?: string | boolean,
  ) {
    const isUnreadOnly = !!(unreadOnly === true || unreadOnly === 'true' || unreadOnly === '1' || (typeof unreadOnly === 'number' && unreadOnly === 1));
    return this.notificationsService.getUserNotifications(
      currentUser.userId,
      page ? parseInt(page.toString(), 10) : 1,
      limit ? parseInt(limit.toString(), 10) : 20,
      !!isUnreadOnly,
    );
  }

  /**
   * Mark notification as read
   * PUT /api/notifications/:id/read
   */
  @Put(':id/read')
  markAsRead(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markAsRead(id, currentUser.userId);
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  @Put('read-all')
  markAllAsRead(@CurrentUser() currentUser: CurrentUserData) {
    return this.notificationsService.markAllAsRead(currentUser.userId);
  }

  /**
   * Delete a single notification
   * DELETE /api/notifications/:id
   */
  @Delete(':id')
  deleteNotification(
    @CurrentUser() currentUser: CurrentUserData,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.deleteNotification(currentUser.userId, id);
  }

  /**
   * Delete multiple notifications
   * POST /api/notifications/bulk-delete
   */
  @Post('bulk-delete')
  deleteNotifications(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() body: { ids: string[] },
  ) {
    return this.notificationsService.deleteNotifications(currentUser.userId, body?.ids || []);
  }

  /**
   * Delete all notifications
   * DELETE /api/notifications
   */
  @Delete()
  deleteAllNotifications(@CurrentUser() currentUser: CurrentUserData) {
    return this.notificationsService.deleteAllNotifications(currentUser.userId);
  }

  /**
   * Get user notification preferences
   * GET /api/notifications/preferences
   */
  @Get('preferences')
  getUserPreferences(@CurrentUser() currentUser: CurrentUserData) {
    return this.notificationsService.getUserPreferences(currentUser.userId);
  }

  /**
   * Update user notification preferences
   * PUT /api/notifications/preferences
   */
  @Put('preferences')
  updateUserPreferences(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() updates: Partial<NotificationPreference>,
  ) {
    return this.notificationsService.updateUserPreferences(currentUser.userId, updates);
  }

  /**
   * Update FCM token for push notifications
   * POST /api/notifications/fcm-token
   */
  @Post('fcm-token')
  updateFcmToken(
    @CurrentUser() currentUser: CurrentUserData,
    @Body() body: { fcmToken: string },
  ) {
    return this.notificationsService.updateFcmToken(currentUser.userId, body.fcmToken);
  }
}
