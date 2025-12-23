import express from "express";
import { FollowStatus } from "@prisma/client";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { HTTP_STATUS } from "../constants";

const router = express.Router();

// All follow routes require auth
router.use(authenticate);

// Send a follow request from the current user to a target user
router.post("/request", async (req: AuthRequest, res) => {
  try {
    const requesterId = req.user?.id;
    const { targetUserId } = req.body || {};

    if (!requesterId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    if (!targetUserId || typeof targetUserId !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "targetUserId is required" });
    }

    if (targetUserId === requesterId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "You cannot follow yourself" });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "User not found" });
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: requesterId,
          followingId: targetUserId,
        },
      },
    });

    if (existing && existing.status === FollowStatus.ACCEPTED) {
      return res.status(HTTP_STATUS.OK).json({
        message: "Already following this user",
        follow: existing,
      });
    }

    if (existing && existing.status === FollowStatus.PENDING) {
      return res.status(HTTP_STATUS.OK).json({
        message: "Follow request already sent",
        follow: existing,
      });
    }

    const follow = existing
      ? await prisma.follow.update({
          where: { id: existing.id },
          data: { status: FollowStatus.PENDING },
        })
      : await prisma.follow.create({
          data: {
            followerId: requesterId,
            followingId: targetUserId,
            status: FollowStatus.PENDING,
          },
        });

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Follow request sent",
      follow,
    });
  } catch (err) {
    console.error("Failed to create follow request", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to create follow request" });
  }
});

// Accept a follow request (only the target user can accept)
router.post("/:id/accept", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const follow = await prisma.follow.findUnique({
      where: { id },
    });

    if (!follow) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "Follow request not found" });
    }

    if (follow.followingId !== userId) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ error: "You cannot accept this request" });
    }

    if (follow.status === FollowStatus.ACCEPTED) {
      return res.status(HTTP_STATUS.OK).json({ follow });
    }

    const updated = await prisma.follow.update({
      where: { id },
      data: { status: FollowStatus.ACCEPTED },
    });

    return res.status(HTTP_STATUS.OK).json({ follow: updated });
  } catch (err) {
    console.error("Failed to accept follow request", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to accept follow request" });
  }
});

// Reject a follow request (only the target user can reject)
router.post("/:id/reject", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const follow = await prisma.follow.findUnique({ where: { id } });

    if (!follow) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: "Follow request not found" });
    }

    if (follow.followingId !== userId) {
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ error: "You cannot reject this request" });
    }

    const updated = await prisma.follow.update({
      where: { id },
      data: { status: FollowStatus.REJECTED },
    });

    return res.status(HTTP_STATUS.OK).json({ follow: updated });
  } catch (err) {
    console.error("Failed to reject follow request", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to reject follow request" });
  }
});

// List pending follow requests (sent or received)
router.get("/requests", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const direction = req.query.direction === "sent" ? "sent" : "received";

    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const where =
      direction === "sent"
        ? { followerId: userId, status: FollowStatus.PENDING }
        : { followingId: userId, status: FollowStatus.PENDING };

    const requests = await prisma.follow.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        follower: { select: { id: true, email: true, displayName: true } },
        following: { select: { id: true, email: true, displayName: true } },
      },
    });

    return res.json({ requests, direction });
  } catch (err) {
    console.error("Failed to fetch follow requests", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch follow requests" });
  }
});

// List accepted followers and following for the current user
router.get("/connections", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId, status: FollowStatus.ACCEPTED },
      include: {
        following: { select: { id: true, email: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const followers = await prisma.follow.findMany({
      where: { followingId: userId, status: FollowStatus.ACCEPTED },
      include: {
        follower: { select: { id: true, email: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      following: following.map((f) => ({
        id: f.id,
        user: f.following,
        since: f.createdAt,
      })),
      followers: followers.map((f) => ({
        id: f.id,
        user: f.follower,
        since: f.createdAt,
      })),
    });
  } catch (err) {
    console.error("Failed to fetch follow lists", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch follow list" });
  }
});

// Feed of public posts from accepted followings
router.get("/feed", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const connections = await prisma.follow.findMany({
      where: { followerId: userId, status: FollowStatus.ACCEPTED },
      select: { followingId: true },
    });

    const followingIds = connections.map((c) => c.followingId);
    if (followingIds.length === 0) {
      return res.json([]);
    }

    const feed = await prisma.journalEntry.findMany({
      where: {
        isPublic: true,
        userId: { in: [...followingIds, userId] },
      },
      include: {
        user: { select: { id: true, email: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json(
      feed.map((entry) => ({
        id: entry.id,
        text: entry.text,
        createdAt: entry.createdAt,
        audioPath: entry.audioPath,
        user: entry.user,
        isPublic: entry.isPublic,
      }))
    );
  } catch (err) {
    console.error("Failed to fetch feed", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch feed" });
  }
});

export default router;
