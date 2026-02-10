import React, { useState, useEffect, useRef } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { useFollowRequests } from "../contexts/FollowRequestContext";
import {
  NotificationService,
  FollowService,
  type Notification,
} from "../services/api";
import "./NotificationBell.css";

export default function NotificationBell() {
  const { notifications, unreadCount, refreshNotifications } =
    useNotifications();
  const { refreshFollowRequests } = useFollowRequests();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleBellClick = async () => {
    if (!isOpen) {
      await loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await NotificationService.markAsRead(notification.id);
        await refreshNotifications();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await NotificationService.deleteNotification(id);
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleAcceptFollowRequest = async (
    followRequestId: string,
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await FollowService.acceptRequest(followRequestId);
      await NotificationService.deleteNotification(notificationId);
      refreshFollowRequests();
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to accept follow request:", error);
    }
  };

  const handleRejectFollowRequest = async (
    followRequestId: string,
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await FollowService.rejectRequest(followRequestId);
      await NotificationService.deleteNotification(notificationId);
      refreshFollowRequests();
      await refreshNotifications();
    } catch (error) {
      console.error("Failed to reject follow request:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div ref={containerRef} className='relative inline-block'>
      <button
        className='notification-bell-button'
        onClick={handleBellClick}
        aria-label={`Notifications ${
          unreadCount > 0 ? `(${unreadCount} unread)` : ""
        }`}
      >
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
          <path d='M13.73 21a2 2 0 0 1-3.46 0' />
        </svg>
        {unreadCount > 0 && (
          <span className='notification-badge'>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className='notification-dropdown'>
          <div className='notification-header'>
            <h3>Notifications</h3>
            {notifications.length > 0 && unreadCount > 0 && (
              <button className='mark-all-read-btn' onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className='notification-list'>
            {loading ? (
              <div className='notification-loading'>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className='notification-empty'>No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${
                    !notification.read ? "unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className='notification-content'>
                    <p className='notification-message'>
                      {notification.message}
                    </p>
                    <span className='notification-time'>
                      {formatTime(notification.createdAt)}
                    </span>
                    {notification.type === "FOLLOW_REQUEST" &&
                      notification.relatedId && (
                        <div className='notification-actions'>
                          <button
                            className='notification-accept-btn'
                            onClick={(e) =>
                              handleAcceptFollowRequest(
                                notification.relatedId!,
                                notification.id,
                                e
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            className='notification-reject-btn'
                            onClick={(e) =>
                              handleRejectFollowRequest(
                                notification.relatedId!,
                                notification.id,
                                e
                              )
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                  </div>
                  <button
                    className='notification-delete-btn'
                    onClick={(e) =>
                      handleDeleteNotification(notification.id, e)
                    }
                    aria-label='Delete notification'
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
