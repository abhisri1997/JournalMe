import prisma from "../db";

export interface NotificationData {
  userId: string;
  type: string;
  message: string;
  relatedId?: string;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: NotificationData) {
    return await prisma.notification.create({
      data,
    });
  }

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(userId: string, unreadOnly = false) {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string) {
    return await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }
}
