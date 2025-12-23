import express from "express";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { UserService } from "../services/userService";
import { HTTP_STATUS } from "../constants";

const router = express.Router();

// Discover other users (for follow requests)
router.get("/search", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    // Privacy guardrail: do not return directory listings for empty/short queries
    if (!query || query.length < 3) {
      return res.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, email: true, displayName: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const ids = users.map((u) => u.id);
    const relationships = await prisma.follow.findMany({
      where: {
        OR: [
          { followerId: userId, followingId: { in: ids } },
          { followerId: { in: ids }, followingId: userId },
        ],
      },
    });

    const formatted = users.map((u) => {
      const outgoing = relationships.find(
        (r) => r.followerId === userId && r.followingId === u.id
      );
      const incoming = relationships.find(
        (r) => r.followingId === userId && r.followerId === u.id
      );

      return {
        ...u,
        outgoingFollowId: outgoing?.id ?? null,
        outgoingStatus: outgoing?.status ?? null,
        incomingFollowId: incoming?.id ?? null,
        incomingStatus: incoming?.status ?? null,
      };
    });

    return res.json({ users: formatted });
  } catch (err) {
    console.error("Failed to fetch users", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch users" });
  }
});

// Get current user profile
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Failed to fetch user:", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ error: "Unauthorized" });
    }

    const { displayName } = req.body;

    // Validate displayName if provided
    if (displayName !== undefined && typeof displayName !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Display name must be a string" });
    }

    // Update user using service
    const updatedUser = await UserService.updateProfile(
      userId,
      displayName || ""
    );

    return res.json(updatedUser);
  } catch (err) {
    console.error("Failed to update user profile:", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update profile" });
  }
});

export default router;
