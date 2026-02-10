import { EventEmitter } from "events";

/**
 * Event Bus - Central event dispatcher
 * Decouples business logic from side effects (notifications, logging, etc.)
 * Similar to Instagram's event-driven architecture
 */

export enum EventType {
  // Follow events
  FOLLOW_REQUEST_CREATED = "follow.request.created",
  FOLLOW_REQUEST_ACCEPTED = "follow.request.accepted",
  FOLLOW_REQUEST_REJECTED = "follow.request.rejected",

  // Journal events
  JOURNAL_CREATED = "journal.created",
  JOURNAL_LIKED = "journal.liked",
  JOURNAL_COMMENTED = "journal.commented",

  // User events
  USER_MENTIONED = "user.mentioned",
  USER_FOLLOWED = "user.followed",
}

export interface BaseEvent {
  type: EventType;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface FollowRequestCreatedEvent extends BaseEvent {
  type: EventType.FOLLOW_REQUEST_CREATED;
  data: {
    followId: string;
    followerId: string;
    followingId: string;
    followerUsername?: string;
  };
}

export interface FollowRequestAcceptedEvent extends BaseEvent {
  type: EventType.FOLLOW_REQUEST_ACCEPTED;
  data: {
    followId: string;
    followerId: string;
    followingId: string;
    acceptedByUsername?: string;
  };
}

export interface FollowRequestRejectedEvent extends BaseEvent {
  type: EventType.FOLLOW_REQUEST_REJECTED;
  data: {
    followId: string;
    followerId: string;
    followingId: string;
  };
}

export interface JournalCreatedEvent extends BaseEvent {
  type: EventType.JOURNAL_CREATED;
  data: {
    journalId: string;
    userId: string;
    username?: string;
    isPublic: boolean;
  };
}

export type AppEvent =
  | FollowRequestCreatedEvent
  | FollowRequestAcceptedEvent
  | FollowRequestRejectedEvent
  | JournalCreatedEvent;

class EventBus extends EventEmitter {
  private static instance: EventBus;

  private constructor() {
    super();
    // Set max listeners to prevent memory leak warnings
    this.setMaxListeners(50);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Publish an event to the bus
   * This decouples the event producer from consumers
   */
  publish(event: AppEvent): void {
    console.log(`[EventBus] Publishing event: ${event.type}`, {
      timestamp: event.timestamp,
      data: event.data,
    });

    this.emit(event.type, event);

    // Also emit a wildcard event for global listeners
    this.emit("*", event);
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe<T extends AppEvent>(
    eventType: EventType,
    handler: (event: T) => void | Promise<void>
  ): void {
    this.on(eventType, async (event: T) => {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[EventBus] Error handling event ${eventType}:`, error);
      }
    });
  }

  /**
   * Subscribe to all events (useful for logging/monitoring)
   */
  subscribeAll(handler: (event: AppEvent) => void | Promise<void>): void {
    this.on("*", async (event: AppEvent) => {
      try {
        await handler(event);
      } catch (error) {
        console.error("[EventBus] Error handling wildcard event:", error);
      }
    });
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(eventType: EventType, handler: (...args: any[]) => void): void {
    this.off(eventType, handler);
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
