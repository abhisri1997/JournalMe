import express from "express";
import { AuthRequest } from "../middleware/auth";
import { NotificationService } from "../services/notificationService";
import { HTTP_STATUS } from "../constants";

const router = express.Router();

// Get all notifications for current user
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const unreadOnly = req.query.unreadOnly === "true";
    const notifications = await NotificationService.getUserNotifications(
      userId,
      unreadOnly
    );

    return res.json({ notifications });
  } catch (err) {
    console.error("Failed to fetch notifications", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch notifications" });
  }
});

// Get unread count
router.get("/unread-count", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const count = await NotificationService.getUnreadCount(userId);
    return res.json({ count });
  } catch (err) {
    console.error("Failed to fetch unread count", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch unread count" });
  }
});

// Mark notification as read
router.patch("/:id/read", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    await NotificationService.markAsRead(id, userId);

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to mark notification as read", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
router.patch("/read-all", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    await NotificationService.markAllAsRead(userId);

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to mark all notifications as read", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to mark all notifications as read" });
  }
});

// Delete notification
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    await NotificationService.deleteNotification(id, userId);

    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete notification", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to delete notification" });
  }
});

export default router;
