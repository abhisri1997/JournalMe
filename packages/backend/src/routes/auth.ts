import express from "express";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import prisma from "../db";
import { generateToken } from "../middleware/auth";
import { sendPasswordResetEmail } from "../utils/mailer";

const router = express.Router();

// Simple login — prefer DB-backed user verification, fall back to DUMMY_USER for compatibility
const DUMMY_USER = { id: "user-1", email: "test@local", password: "password" };

router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (password.length < 8)
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "User already exists" });

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const hash = await bcrypt.hash(password, saltRounds);
  const user = await prisma.user.create({
    data: { email, passwordHash: hash },
  });

  const token = generateToken({ id: user.id, email: user.email });
  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, displayName: user.displayName },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  // Try DB first
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = generateToken({ id: user.id, email: user.email });
    return res.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  }

  // Fallback to dummy user for tests/dev
  if (email !== DUMMY_USER.email || password !== DUMMY_USER.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = generateToken({ id: DUMMY_USER.id, email: DUMMY_USER.email });
  return res.json({
    token,
    user: { id: DUMMY_USER.id, email: DUMMY_USER.email },
  });
});

router.post("/forgot-password", async (req, res) => {
  debugger;
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists - for security
      return res.status(200).json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry,
      },
    });

    // Send email with reset link
    const resetUrl =
      process.env.FRONTEND_URL || "http://localhost:5173/reset-password";
    await sendPasswordResetEmail(email, resetToken, resetUrl);

    return res.status(200).json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Error in forgot-password:", err);
    return res.status(500).json({ error: "Failed to process password reset" });
  }
});

router.post("/reset-password", async (req, res) => {
  debugger;
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    // Find user with valid reset token
    const users = await prisma.user.findMany({
      where: {
        resetTokenExpiry: {
          gt: new Date(), // Token not expired
        },
      },
    });

    let userWithValidToken = null;
    for (const user of users) {
      if (user.resetToken && (await bcrypt.compare(token, user.resetToken))) {
        userWithValidToken = user;
        break;
      }
    }

    if (!userWithValidToken) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: userWithValidToken.id },
      data: {
        passwordHash: newPasswordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return res.status(200).json({
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (err) {
    console.error("Error in reset-password:", err);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;
