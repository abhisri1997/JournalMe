import express from "express";
import prisma from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Get current user profile
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    debugger; // <-- Debugger will stop here
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
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
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile
router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { displayName } = req.body;

    // Validate displayName if provided
    if (displayName !== undefined && typeof displayName !== "string") {
      return res.status(400).json({ error: "Display name must be a string" });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { displayName: displayName || null },
      select: { id: true, email: true, displayName: true, createdAt: true },
    });

    return res.json(updatedUser);
  } catch (err) {
    console.error("Failed to update user profile:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
