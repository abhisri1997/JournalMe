import express from "express";
import { generateToken } from "../middleware/auth";
import { sendPasswordResetEmail } from "../utils/mailer";
import { UserService } from "../services/userService";
import { PasswordService } from "../services/passwordService";
import { HTTP_STATUS, PASSWORD_CONFIG, DUMMY_USER } from "../constants";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Email and password are required" });
    }

    const user = await UserService.createUser({ email, password });
    const token = generateToken({ id: user.id, email: user.email });

    return res.status(HTTP_STATUS.CREATED).json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    if (message.includes("User already exists")) {
      return res.status(HTTP_STATUS.CONFLICT).json({ error: message });
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ error: "Email and password are required" });
  }

  // Try to authenticate with database
  const user = await UserService.authenticateUser(email, password);

  if (user) {
    const token = generateToken({ id: user.id, email: user.email });
    return res.json({
      token,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  }

  // Fallback to dummy user for tests/dev
  if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
    const token = generateToken({ id: DUMMY_USER.id, email: DUMMY_USER.email });
    return res.json({
      token,
      user: { id: DUMMY_USER.id, email: DUMMY_USER.email },
    });
  }

  return res
    .status(HTTP_STATUS.UNAUTHORIZED)
    .json({ error: "Invalid credentials" });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Email is required" });
    }

    // Find user by email
    const user = await UserService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists - for security
      return res.status(HTTP_STATUS.OK).json({
        message:
          "If an account exists with this email, a reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = PasswordService.generateResetToken();
    const resetTokenExpiry = new Date(
      Date.now() + PASSWORD_CONFIG.RESET_TOKEN_EXPIRY_HOURS * 3600000
    );

    // Save reset token to database
    await UserService.setResetToken(user.id, resetToken, resetTokenExpiry);

    // Send email with reset link
    const resetUrl =
      process.env.FRONTEND_URL || "http://localhost:5173/reset-password";
    await sendPasswordResetEmail(email, resetToken, resetUrl);

    return res.status(HTTP_STATUS.OK).json({
      message:
        "If an account exists with this email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Error in forgot-password:", err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to process password reset" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};

    if (!token || !newPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Token and new password are required" });
    }

    // Find user with valid reset token
    const user = await UserService.findByResetToken(token);

    if (!user) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: "Invalid or expired reset token" });
    }

    // Reset password
    await UserService.resetPassword(user.id, newPassword);

    return res
      .status(HTTP_STATUS.OK)
      .json({ message: "Password reset successfully" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reset password";
    console.error("Error in reset-password:", err);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: message });
  }
});

export default router;
