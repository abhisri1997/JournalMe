import { eventBus, EventType, AppEvent } from "../EventBus";
import { NotificationService } from "../../services/notificationService";
import prisma from "../../db";

/**
 * Notification Event Handler
 * Consumes events from the event bus and creates notifications
 * Decoupled from business logic - follows Instagram's pattern
 */
export class NotificationEventHandler {
  /**
   * Initialize all notification event listeners
   */
  static initialize(): void {
    console.log(
      "[NotificationEventHandler] Initializing notification handlers"
    );

    // Handle follow request events
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

    // Subscribe to all events for logging (optional)
    eventBus.subscribeAll(this.logEvent.bind(this));
  }

  /**
   * Handle follow request created event
   */
  private static async handleFollowRequestCreated(
    event: AppEvent
  ): Promise<void> {
    if (event.type !== EventType.FOLLOW_REQUEST_CREATED) return;

    const { followerId, followingId, followerUsername, followId } = event.data;

    console.log(
      `[NotificationEventHandler] Processing FOLLOW_REQUEST_CREATED for user ${followingId}`
    );

    try {
      // Fetch follower username if not provided
      let username = followerUsername;
      if (!username) {
        const follower = await prisma.user.findUnique({
          where: { id: followerId },
          select: { username: true },
        });
        username = follower?.username || "Someone";
      }

      // Create notification
      await NotificationService.createNotification({
        userId: followingId,
        type: "FOLLOW_REQUEST",
        message: `${username} sent you a follow request`,
        relatedId: followId,
      });

      console.log(
        `[NotificationEventHandler] Notification created for follow request`
      );
    } catch (error) {
      console.error(
        "[NotificationEventHandler] Failed to create follow request notification:",
        error
      );
      // Don't throw - we don't want to break the main flow
    }
  }

  /**
   * Handle follow request accepted event
   */
  private static async handleFollowRequestAccepted(
    event: AppEvent
  ): Promise<void> {
    if (event.type !== EventType.FOLLOW_REQUEST_ACCEPTED) return;

    const { followerId, followingId, acceptedByUsername, followId } =
      event.data;

    console.log(
      `[NotificationEventHandler] Processing FOLLOW_REQUEST_ACCEPTED for user ${followerId}`
    );

    try {
      // Fetch username if not provided
      let username = acceptedByUsername;
      if (!username) {
        const acceptedBy = await prisma.user.findUnique({
          where: { id: followingId },
          select: { username: true },
        });
        username = acceptedBy?.username || "Someone";
      }

      // Notify the original requester that their request was accepted
      await NotificationService.createNotification({
        userId: followerId,
        type: "FOLLOW_ACCEPTED",
        message: `${username} accepted your follow request`,
        relatedId: followId,
      });

      console.log(
        `[NotificationEventHandler] Notification created for follow acceptance`
      );
    } catch (error) {
      console.error(
        "[NotificationEventHandler] Failed to create follow accepted notification:",
        error
      );
    }
  }

  /**
   * Handle new journal created (notify followers)
   */
  private static async handleJournalCreated(event: AppEvent): Promise<void> {
    if (event.type !== EventType.JOURNAL_CREATED) return;

    const { journalId, userId, username, isPublic } = event.data;

    // Only notify for public journals
    if (!isPublic) {
      return;
    }

    console.log(
      `[NotificationEventHandler] Processing JOURNAL_CREATED for journal ${journalId}`
    );

    try {
      // Get all accepted followers
      const followers = await prisma.follow.findMany({
        where: {
          followingId: userId,
          status: "ACCEPTED",
        },
        select: {
          followerId: true,
        },
      });

      // Create notifications for all followers (fan-out)
      const notificationPromises = followers.map((follow) =>
        NotificationService.createNotification({
          userId: follow.followerId,
          type: "NEW_JOURNAL",
          message: `${username || "Someone you follow"} posted a new journal`,
          relatedId: journalId,
        })
      );

      await Promise.all(notificationPromises);

      console.log(
        `[NotificationEventHandler] Created ${followers.length} notifications for new journal`
      );
    } catch (error) {
      console.error(
        "[NotificationEventHandler] Failed to create journal notifications:",
        error
      );
    }
  }

  /**
   * Log all events (useful for debugging/monitoring)
   */
  private static logEvent(event: AppEvent): void {
    console.log(`[NotificationEventHandler] Event logged:`, {
      type: event.type,
      timestamp: event.timestamp,
      data: event.data,
    });
  }
}
