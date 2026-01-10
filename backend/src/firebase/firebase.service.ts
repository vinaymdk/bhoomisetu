import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

export interface FirebaseUser {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  emailVerified?: boolean;
  phoneNumberVerified?: boolean;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app!: admin.app.App;

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Try to load credentials from environment variable (path to JSON file)
      const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;
      let serviceAccount: admin.ServiceAccount;

      if (credentialsPath && fs.existsSync(credentialsPath)) {
        // Load from file path specified in env
        serviceAccount = require(path.resolve(credentialsPath));
        this.logger.log(`Firebase credentials loaded from: ${credentialsPath}`);
      } else if (fs.existsSync(path.join(__dirname, '../../bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json'))) {
        // Load from default location (for development)
        serviceAccount = require(path.join(__dirname, '../../bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json'));
        this.logger.log('Firebase credentials loaded from default location');
      } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        // Load from environment variables (for production/containerized deployments)
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };
        this.logger.log('Firebase credentials loaded from environment variables');
      } else {
        throw new Error('Firebase credentials not found. Set FIREBASE_CREDENTIALS_PATH or environment variables.');
      }

      if (admin.apps.length === 0) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.app = admin.apps[0] as admin.app.App;
        this.logger.log('Firebase Admin SDK already initialized');
      }
    } catch (error: any) {
      this.logger.error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify ID token (for social login and Firebase Auth)
   */
  async verifyIdToken(idToken: string): Promise<FirebaseUser> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phoneNumber: decodedToken.phone_number,
        displayName: decodedToken.name,
        emailVerified: decodedToken.email_verified,
        phoneNumberVerified: !!decodedToken.phone_number,
      };
    } catch (error: any) {
      this.logger.error(`Firebase ID token verification failed: ${error.message}`);
      throw new Error(`Invalid Firebase token: ${error.message}`);
    }
  }

  /**
   * Get user by UID
   */
  async getUserByUid(uid: string): Promise<FirebaseUser | null> {
    try {
      const userRecord = await admin.auth().getUser(uid);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        phoneNumber: userRecord.phoneNumber,
        displayName: userRecord.displayName || undefined,
        emailVerified: userRecord.emailVerified,
        phoneNumberVerified: !!userRecord.phoneNumber,
      };
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return null;
      }
      this.logger.error(`Error fetching Firebase user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify phone number OTP (for phone authentication)
   * Note: Firebase handles OTP on client side, backend verifies the ID token
   * This method is for validation purposes
   */
  async verifyPhoneNumber(phoneNumber: string, idToken: string): Promise<boolean> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Verify phone number matches
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      return userRecord.phoneNumber === phoneNumber;
    } catch (error: any) {
      this.logger.error(`Phone number verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Create custom token (if needed for client-side auth)
   */
  async createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
    try {
      return await admin.auth().createCustomToken(uid, additionalClaims);
    } catch (error: any) {
      this.logger.error(`Custom token creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete user (for admin operations)
   */
  async deleteUser(uid: string): Promise<void> {
    try {
      await admin.auth().deleteUser(uid);
      this.logger.log(`Firebase user ${uid} deleted`);
    } catch (error: any) {
      this.logger.error(`Failed to delete Firebase user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update user email verification status
   */
  async updateUserEmailVerification(uid: string, emailVerified: boolean): Promise<void> {
    try {
      await admin.auth().updateUser(uid, { emailVerified });
    } catch (error: any) {
      this.logger.error(`Failed to update email verification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get Firebase app instance (for advanced operations)
   */
  getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return this.app;
  }

  /**
   * Send push notification via Firebase Cloud Messaging (FCM)
   */
  async sendPushNotification(
    fcmToken: string,
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
    options?: {
      priority?: 'normal' | 'high';
      sound?: string;
      badge?: number;
    },
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data || {},
        apns: {
          payload: {
            aps: {
              sound: options?.sound || 'default',
              badge: options?.badge || 1,
            },
          },
        },
        android: {
          priority: options?.priority === 'high' ? 'high' : 'normal',
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send push notification to multiple tokens
   */
  async sendMulticastPushNotification(
    fcmTokens: string[],
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: data || {},
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(
        `Multicast push notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`,
      );
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to send multicast push notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get messaging instance (for advanced FCM operations)
   */
  getMessaging(): admin.messaging.Messaging {
    if (!this.app) {
      throw new Error('Firebase Admin SDK not initialized');
    }
    return admin.messaging(this.app);
  }
}
