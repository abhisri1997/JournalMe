import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { NotificationService } from "../services/notificationService";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

/**
 * WebSocket Manager - Real-time notification delivery
 * Similar to Instagram's persistent connection architecture
 * Keeps users connected and delivers notifications instantly
 */
export class WebSocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Allow all origins in development
          // In production, you should specify exact origins via FRONTEND_URL
          if (process.env.NODE_ENV === "production") {
            const allowedOrigins = process.env.FRONTEND_URL
              ? process.env.FRONTEND_URL.split(",")
              : [];
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
          } else {
            // Development: allow all origins (localhost, network IPs, etc.)
            callback(null, true);
          }
        },
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
      allowEIO3: true,
    });

    this.initialize();
  }

  private initialize(): void {
    console.log("[WebSocketManager] Initializing WebSocket server");

    // Authentication middleware
    this.io.use((socket: any, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      console.log("[WebSocketManager] Auth attempt:", {
        hasAuthToken: !!socket.handshake.auth.token,
        hasQueryToken: !!socket.handshake.query.token,
        socketId: socket.id,
      });

      if (!token) {
        console.log("[WebSocketManager] No token provided");
        return next(new Error("Authentication required"));
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          id: string;
          email: string;
        };
        socket.userId = decoded.id; // JWT has 'id' field, not 'userId'
        console.log("[WebSocketManager] Auth successful for user:", decoded.id);
        next();
      } catch (error) {
        console.error("[WebSocketManager] Token verification failed:", error);
        next(new Error("Invalid token"));
      }
    });

    // Handle connections
    this.io.on("connection", (socket: any) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(
      `[WebSocketManager] User ${userId} connected (socket: ${socket.id})`
    );

    // Track user's socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socket.id);

    // Send initial notification count
    this.sendUnreadCount(userId);

    // Handle events
    socket.on(
      "mark_notification_read",
      async (data: { notificationId: string }) => {
        await this.handleMarkAsRead(userId, data.notificationId);
      }
    );

    socket.on("mark_all_read", async () => {
      await this.handleMarkAllAsRead(userId);
    });

    socket.on("disconnect", () => {
      console.log(
        `[WebSocketManager] User ${userId} disconnected (socket: ${socket.id})`
      );
      this.userSockets.get(userId)?.delete(socket.id);

      // Clean up empty sets
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    });

    socket.on("ping", () => {
      socket.emit("pong");
    });
  }

  /**
   * Send notification to a specific user
   * Handles multi-device scenarios (multiple sockets per user)
   */
  async sendNotificationToUser(
    userId: string,
    notification: {
      id: string;
      type: string;
      message: string;
      relatedId?: string;
      createdAt: Date;
    }
  ): Promise<void> {
    const socketIds = this.userSockets.get(userId);

    if (!socketIds || socketIds.size === 0) {
      console.log(
        `[WebSocketManager] User ${userId} not connected - notification will be queued`
      );
      return;
    }

    console.log(
      `[WebSocketManager] Sending notification to user ${userId} (${socketIds.size} devices)`
    );

    // Send to all user's connected devices
    socketIds.forEach((socketId) => {
      this.io.to(socketId).emit("notification", {
        ...notification,
        timestamp: new Date(),
      });
    });

    // Also update unread count
    await this.sendUnreadCount(userId);
  }

  /**
   * Send unread count to user
   */
  private async sendUnreadCount(userId: string): Promise<void> {
    try {
      const count = await NotificationService.getUnreadCount(userId);
      const socketIds = this.userSockets.get(userId);

      socketIds?.forEach((socketId) => {
        this.io.to(socketId).emit("unread_count", { count });
      });
    } catch (error) {
      console.error("[WebSocketManager] Failed to send unread count:", error);
    }
  }

  /**
   * Handle mark as read from client
   */
  private async handleMarkAsRead(
    userId: string,
    notificationId: string
  ): Promise<void> {
    try {
      await NotificationService.markAsRead(notificationId, userId);
      await this.sendUnreadCount(userId);
    } catch (error) {
      console.error("[WebSocketManager] Failed to mark as read:", error);
    }
  }

  /**
   * Handle mark all as read from client
   */
  private async handleMarkAllAsRead(userId: string): Promise<void> {
    try {
      await NotificationService.markAllAsRead(userId);
      await this.sendUnreadCount(userId);
    } catch (error) {
      console.error("[WebSocketManager] Failed to mark all as read:", error);
    }
  }

  /**
   * Broadcast to all connected users (e.g., system maintenance)
   */
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  /**
   * Get connected user count
   */
  getConnectedUserCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return (
      this.userSockets.has(userId) &&
      (this.userSockets.get(userId)?.size ?? 0) > 0
    );
  }

  /**
   * Get Socket.IO server instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

// Export singleton (will be initialized in index.ts)
let websocketManager: WebSocketManager | null = null;

export function initializeWebSocketManager(
  httpServer: HTTPServer
): WebSocketManager {
  if (!websocketManager) {
    websocketManager = new WebSocketManager(httpServer);
  }
  return websocketManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return websocketManager;
}
