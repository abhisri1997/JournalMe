/**
 * Push Notification Service
 * Handles FCM (Firebase Cloud Messaging) for iOS/Android push notifications
 * Used when user's app is in background or closed
 *
 * Setup instructions:
 * 1. Create Firebase project: https://console.firebase.google.com/
 * 2. Download service account JSON
 * 3. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env
 * 4. Install: npm install firebase-admin
 * 5. Register device tokens from mobile app
 */

interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

interface DeviceToken {
  userId: string;
  token: string;
  platform: "ios" | "android" | "web";
  createdAt: Date;
}

export class PushNotificationService {
  private fcmEnabled: boolean = false;
  private admin: any = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private async initialize(): Promise<void> {
    try {
      // Only initialize if Firebase credentials are provided
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (!serviceAccountPath) {
        console.log(
          "[PushNotificationService] Firebase not configured - push notifications disabled"
        );
        console.log(
          "[PushNotificationService] To enable: Set FIREBASE_SERVICE_ACCOUNT_PATH in .env"
        );
        return;
      }

      // Dynamically import firebase-admin
      const admin = await import("firebase-admin");
      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.admin = admin;
      this.fcmEnabled = true;

      console.log(
        "[PushNotificationService] Firebase initialized successfully"
      );
    } catch (error) {
      console.error(
        "[PushNotificationService] Failed to initialize Firebase:",
        error
      );
      console.log(
        "[PushNotificationService] Push notifications will be disabled"
      );
    }
  }

  /**
   * Send push notification to a user's devices
   */
  async sendToUser(payload: PushNotificationPayload): Promise<void> {
    if (!this.fcmEnabled) {
      console.log(
        "[PushNotificationService] Push disabled - skipping notification"
      );
      return;
    }

    try {
      // In production, you'd fetch device tokens from database
      const deviceTokens = await this.getUserDeviceTokens(payload.userId);

      if (deviceTokens.length === 0) {
        console.log(
          `[PushNotificationService] No device tokens found for user ${payload.userId}`
        );
        return;
      }

      // Send to all user's devices
      const promises = deviceTokens.map((token) =>
        this.sendToToken(token.token, payload)
      );

      const results = await Promise.allSettled(promises);

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      console.log(
        `[PushNotificationService] Sent notifications: ${succeeded} succeeded, ${failed} failed`
      );
    } catch (error) {
      console.error(
        "[PushNotificationService] Failed to send push notification:",
        error
      );
    }
  }

  /**
   * Send notification to specific device token
   */
  private async sendToToken(
    token: string,
    payload: PushNotificationPayload
  ): Promise<void> {
    if (!this.admin) {
      throw new Error("Firebase not initialized");
    }

    const message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: payload.data || {},
      // iOS specific
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      // Android specific
      android: {
        priority: "high" as const,
        notification: {
          sound: "default",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
    };

    await this.admin.messaging().send(message);
  }

  /**
   * Register device token for push notifications
   * Called from mobile app after login
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: "ios" | "android" | "web"
  ): Promise<void> {
    // TODO: Store in database
    // await prisma.deviceToken.create({
    //   data: { userId, token, platform }
    // });

    console.log(
      `[PushNotificationService] Registered device token for user ${userId} (${platform})`
    );
  }

  /**
   * Remove device token (when user logs out)
   */
  async unregisterDeviceToken(token: string): Promise<void> {
    // TODO: Remove from database
    // await prisma.deviceToken.delete({ where: { token } });

    console.log("[PushNotificationService] Unregistered device token");
  }

  /**
   * Get all device tokens for a user
   * In production, this would query your database
   */
  private async getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
    // TODO: Implement database query
    // return await prisma.deviceToken.findMany({
    //   where: { userId }
    // });

    return [];
  }

  /**
   * Send notification to topic (e.g., "all_users", "beta_testers")
   */
  async sendToTopic(
    topic: string,
    payload: Omit<PushNotificationPayload, "userId">
  ): Promise<void> {
    if (!this.fcmEnabled || !this.admin) {
      return;
    }

    try {
      const message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
      };

      await this.admin.messaging().send(message);
      console.log(
        `[PushNotificationService] Sent notification to topic: ${topic}`
      );
    } catch (error) {
      console.error(
        "[PushNotificationService] Failed to send topic notification:",
        error
      );
    }
  }

  /**
   * Test push notification (for debugging)
   */
  async sendTestNotification(token: string): Promise<void> {
    if (!this.fcmEnabled) {
      console.log("[PushNotificationService] Push disabled - cannot send test");
      return;
    }

    await this.sendToToken(token, {
      userId: "test",
      title: "Test Notification",
      body: "This is a test notification from JournalMe",
      data: { test: "true" },
    });

    console.log("[PushNotificationService] Test notification sent");
  }
}

// Export singleton
export const pushNotificationService = new PushNotificationService();
