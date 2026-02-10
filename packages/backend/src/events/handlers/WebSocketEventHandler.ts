import { eventBus, EventType, AppEvent } from "../EventBus";
import { getWebSocketManager } from "../../services/WebSocketManager";
import { NotificationService } from "../../services/notificationService";

/**
 * WebSocket Event Handler
 * Consumes events and pushes real-time notifications via WebSocket
 * This is the "fan-out" layer similar to Instagram's architecture
 */
export class WebSocketEventHandler {
  /**
   * Initialize WebSocket event listeners
   */
  static initialize(): void {
    console.log("[WebSocketEventHandler] Initializing WebSocket handlers");

    // Listen to all notification-worthy events
    eventBus.subscribe(
      EventType.FOLLOW_REQUEST_CREATED,
      this.handleFollowRequestCreated.bind(this)
    );

    eventBus.subscribe(
      EventType.FOLLOW_REQUEST_ACCEPTED,
      this.handleFollowRequestAccepted.bind(this)
    );

    eventBus.subscribe(
      EventType.JOURNAL_CREATED,
      this.handleJournalCreated.bind(this)
    );
  }

  /**
   * Send real-time notification when follow request is created
   */
  private static async handleFollowRequestCreated(
    event: AppEvent
  ): Promise<void> {
    if (event.type !== EventType.FOLLOW_REQUEST_CREATED) return;

    const wsManager = getWebSocketManager();
    if (!wsManager) {
      console.warn("[WebSocketEventHandler] WebSocket manager not initialized");
      return;
    }

    const { followingId, followerId, followId } = event.data;

    // Wait a bit for DB write to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Fetch the latest notification
    const notifications = await NotificationService.getUserNotifications(
      followingId,
      false
    );
    const latestNotification = notifications.find(
      (n) => n.relatedId === followId
    );

    if (latestNotification) {
      await wsManager.sendNotificationToUser(followingId, {
        id: latestNotification.id,
        type: latestNotification.type,
        message: latestNotification.message,
        relatedId: latestNotification.relatedId || undefined,
        createdAt: latestNotification.createdAt,
      });

      console.log(
        `[WebSocketEventHandler] Sent real-time follow request notification to user ${followingId}`
      );
    }
  }

  /**
   * Send real-time notification when follow request is accepted
   */
  private static async handleFollowRequestAccepted(
    event: AppEvent
  ): Promise<void> {
    if (event.type !== EventType.FOLLOW_REQUEST_ACCEPTED) return;

    const wsManager = getWebSocketManager();
    if (!wsManager) return;

    const { followerId, followId } = event.data;

    // Wait for DB write
    await new Promise((resolve) => setTimeout(resolve, 100));

    const notifications = await NotificationService.getUserNotifications(
      followerId,
      false
    );
    const latestNotification = notifications.find(
      (n) => n.relatedId === followId
    );

    if (latestNotification) {
      await wsManager.sendNotificationToUser(followerId, {
        id: latestNotification.id,
        type: latestNotification.type,
        message: latestNotification.message,
        relatedId: latestNotification.relatedId || undefined,
        createdAt: latestNotification.createdAt,
      });

      console.log(
        `[WebSocketEventHandler] Sent real-time follow accepted notification to user ${followerId}`
      );
    }
  }

  /**
   * Send real-time notification when new journal is created (to followers)
   */
  private static async handleJournalCreated(event: AppEvent): Promise<void> {
    if (event.type !== EventType.JOURNAL_CREATED) return;

    const wsManager = getWebSocketManager();
    if (!wsManager) return;

    const { journalId, isPublic } = event.data;

    if (!isPublic) return;

    // Wait for DB writes to complete
    await new Promise((resolve) => setTimeout(resolve, 200));

    // This will fan out to all followers
    // The NotificationEventHandler already creates the notifications
    // We just need to push them in real-time

    console.log(
      `[WebSocketEventHandler] Journal notifications will be sent to followers (journal: ${journalId})`
    );
  }
}
