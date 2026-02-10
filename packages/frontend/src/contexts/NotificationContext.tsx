import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { NotificationService, type Notification } from "../services/api";
import { websocketService } from "../services/websocket";
import { getToken } from "../auth";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Connect WebSocket for real-time updates
  useEffect(() => {
    const token = getToken();
    console.log("[NotificationContext] Initializing WebSocket connection");
    console.log("[NotificationContext] Token exists:", !!token);

    if (!token) {
      console.log(
        "[NotificationContext] No token found - skipping WebSocket connection"
      );
      return;
    }

    websocketService.on({
      onNotification: (notification) => {
        console.log(
          "[NotificationContext] Received notification:",
          notification
        );
        const normalized: Notification = {
          ...notification,
          userId: (notification as any).userId || "",
          createdAt: new Date(notification.createdAt).toISOString(),
          read: notification.read ?? false,
        } as Notification;

        setNotifications((prev) => [normalized, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Notify other parts of the app to refresh follow state when a follow request changes
        if (
          normalized.type === "follow.request.accepted" ||
          normalized.type === "follow.request.created"
        ) {
          window.dispatchEvent(new CustomEvent("follow-request-updated"));
        }
      },
      onUnreadCount: (count) => {
        console.log("[NotificationContext] Unread count updated:", count);
        setUnreadCount(count);
      },
      onConnect: () => {
        console.log("[NotificationContext] WebSocket connected!");
      },
      onDisconnect: () => {
        console.log("[NotificationContext] WebSocket disconnected");
      },
      onError: (error) => {
        console.error("[NotificationContext] WebSocket error:", error);
      },
    });

    console.log("[NotificationContext] Calling websocketService.connect()");
    websocketService.connect(token);

    return () => {
      console.log(
        "[NotificationContext] Cleaning up - disconnecting WebSocket"
      );
      websocketService.disconnect();
    };
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const [notifs, count] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, refreshNotifications, isLoading }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};
