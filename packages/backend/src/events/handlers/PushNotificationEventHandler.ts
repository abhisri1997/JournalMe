import { eventBus, EventType, AppEvent } from "../EventBus";
import { pushNotificationService } from "../../services/PushNotificationService";
import { getWebSocketManager } from "../../services/WebSocketManager";

/**
 * Push Notification Event Handler
 * Sends OS push notifications (FCM) when users are offline
 * Similar to Instagram's fallback mechanism
 */
export class PushNotificationEventHandler {
  /**
   * Initialize push notification event listeners
   */
  static initialize(): void {
    console.log("[PushNotificationEventHandler] Initializing push handlers");

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
   * Send push notification for follow request
   * Only sends if user is offline (no active WebSocket connection)
   */
  private static async handleFollowRequestCreated(
    event: AppEvent
  ): Promise<void> {
    if (event.type !== EventType.FOLLOW_REQUEST_CREATED) return;

    const { followingId, followerUsername } = event.data;
    const wsManager = getWebSocketManager();

    // Check if user is online
    const isOnline = wsManager?.isUserOnline(followingId);

    if (isOnline) {
      console.log(
        `[PushNotificationEventHandler] User ${followingId} is online - skipping push notification`
      );
      return;
    }

    // User is offline - send push notification
    console.log(
      `[PushNotificationEventHandler] User ${followingId} is offline - sending push notification`
    );

    await pushNotificationService.sendToUser({
      userId: followingId,
      title: "New Follow Request",
      body: `${followerUsername || "Someone"} sent you a follow request`,
      data: {
        type: "FOLLOW_REQUEST",
        followerId: event.data.followerId,
        followId: event.data.followId,
      },
    });
  }

  /**
   * Send push notification for follow acceptance
   */
  private static async handleFollowRequestAccepted(
    event: AppEvent
  ): Promise<void> {
    if (event.type !== EventType.FOLLOW_REQUEST_ACCEPTED) return;

    const { followerId, acceptedByUsername } = event.data;
    const wsManager = getWebSocketManager();

    const isOnline = wsManager?.isUserOnline(followerId);

    if (isOnline) {
      console.log(
        `[PushNotificationEventHandler] User ${followerId} is online - skipping push`
      );
      return;
    }

    console.log(
      `[PushNotificationEventHandler] User ${followerId} is offline - sending push`
    );

    await pushNotificationService.sendToUser({
      userId: followerId,
      title: "Follow Request Accepted",
      body: `${acceptedByUsername || "Someone"} accepted your follow request`,
      data: {
        type: "FOLLOW_ACCEPTED",
        followingId: event.data.followingId,
        followId: event.data.followId,
      },
    });
  }

  /**
   * Send push notifications to offline followers for new journal
   */
  private static async handleJournalCreated(event: AppEvent): Promise<void> {
    if (event.type !== EventType.JOURNAL_CREATED) return;

    const { username, isPublic } = event.data;

    if (!isPublic) return;

    console.log(
      `[PushNotificationEventHandler] Processing push notifications for new journal`
    );

    // This would need to fetch followers and check who's offline
    // For now, just log it
    console.log(
      `[PushNotificationEventHandler] Would send push to offline followers of ${username}`
    );
  }
}
