import { io, Socket } from "socket.io-client";

// Get backend URL - handle both absolute and relative URLs
const getBackendURL = (): string => {
  const viteUrl = import.meta.env.VITE_API_URL;
  if (viteUrl) return viteUrl;

  // In development, use relative path to leverage Vite proxy
  // This avoids CORS and certificate issues
  // The proxy will forward to the actual backend
  if (import.meta.env.DEV) {
    return ""; // Empty string = same origin, will use Vite proxy
  }

  // Production fallback: construct from current location
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;

    // Match the protocol of the page (http -> http, https -> https)
    const wsProtocol = protocol === "https:" ? "https" : "http";
    return `${wsProtocol}://${hostname}:4000`;
  }

  return "http://localhost:4000";
};

const BACKEND_URL = getBackendURL();
console.log("[WebSocketService] Backend URL:", BACKEND_URL);

export interface Notification {
  id: string;
  type: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
  timestamp?: Date;
}

interface NotificationHandler {
  onNotification?: (notification: Notification) => void;
  onUnreadCount?: (count: number) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * WebSocket Service - Real-time notification client
 * Maintains persistent connection to backend for instant notifications
 * Similar to Instagram's real-time architecture
 */
class WebSocketService {
  private socket: Socket | null = null;
  private handlers: NotificationHandler = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server with authentication
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log("[WebSocketService] Already connected");
      return;
    }

    console.log(
      "[WebSocketService] Connecting to WebSocket server:",
      BACKEND_URL
    );
    console.log(
      "[WebSocketService] Using token:",
      token ? `${token.substring(0, 20)}...` : "NO TOKEN"
    );

    this.socket = io(BACKEND_URL, {
      auth: { token },
      // Start with polling (works through Vite proxy), upgrade to WebSocket if possible
      // This avoids certificate issues with self-signed certs on WSS
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      // Allow upgrade to WebSocket after successful polling connection
      upgrade: true,
    });

    this.setupListeners();
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("[WebSocketService] Connected to server");
      this.reconnectAttempts = 0;
      this.handlers.onConnect?.();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[WebSocketService] Disconnected:", reason);
      this.handlers.onDisconnect?.();
    });

    this.socket.on("connect_error", (error) => {
      console.error("[WebSocketService] Connection error:", error);
      this.reconnectAttempts++;
      this.handlers.onError?.(error);
    });

    // Real-time notification received
    this.socket.on("notification", (data: Notification) => {
      console.log("[WebSocketService] Received notification:", data);
      this.handlers.onNotification?.(data);

      // Show browser notification if permission granted
      this.showBrowserNotification(data);
    });

    // Unread count update
    this.socket.on("unread_count", (data: { count: number }) => {
      console.log("[WebSocketService] Unread count:", data.count);
      this.handlers.onUnreadCount?.(data.count);
    });

    this.socket.on("pong", () => {
      console.log("[WebSocketService] Pong received");
    });
  }

  /**
   * Register event handlers
   */
  on(handlers: NotificationHandler): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      console.log("[WebSocketService] Disconnecting");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("mark_notification_read", { notificationId });
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    if (this.socket?.connected) {
      this.socket.emit("mark_all_read");
    }
  }

  /**
   * Send ping to test connection
   */
  ping(): void {
    if (this.socket?.connected) {
      this.socket.emit("ping");
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Show browser notification (if permission granted)
   */
  private showBrowserNotification(notification: Notification): void {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("JournalMe", {
        body: notification.message,
        icon: "/logo.png",
        badge: "/logo.png",
        tag: notification.id,
        requireInteraction: false,
      });
    }
  }

  /**
   * Request browser notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("[WebSocketService] Browser notifications not supported");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }
}

// Export singleton
export const websocketService = new WebSocketService();
