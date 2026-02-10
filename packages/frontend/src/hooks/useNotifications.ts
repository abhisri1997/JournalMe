import { useState, useEffect, useCallback } from "react";
import { websocketService, Notification } from "../services/websocket";
import { getToken } from "../auth";

/**
 * Hook for real-time notifications
 * Automatically connects/disconnects from WebSocket server
 * Manages notification state and unread count
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [latestNotification, setLatestNotification] =
    useState<Notification | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.log("[useNotifications] No token - not connecting to WebSocket");
      return;
    }

    // Setup handlers before connecting
    websocketService.on({
      onNotification: (notification) => {
        console.log("[useNotifications] New notification:", notification);
        setLatestNotification(notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      },
      onUnreadCount: (count) => {
        console.log("[useNotifications] Unread count updated:", count);
        setUnreadCount(count);
      },
      onConnect: () => {
        console.log("[useNotifications] Connected to WebSocket");
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("[useNotifications] Disconnected from WebSocket");
        setIsConnected(false);
      },
      onError: (error) => {
        console.error("[useNotifications] WebSocket error:", error);
      },
    });

    // Connect to WebSocket
    websocketService.connect(token);

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    websocketService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    websocketService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearLatest = useCallback(() => {
    setLatestNotification(null);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    latestNotification,
    markAsRead,
    markAllAsRead,
    clearLatest,
  };
}
