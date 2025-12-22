import nodemailer from "nodemailer";

// Create a transporter
// In development, use ethereal for testing
// In production, use actual SMTP credentials
export async function createTransporter() {
  // Check if we're in test/dev mode without real SMTP
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    // For testing/development, create an ethereal account
    if (process.env.NODE_ENV !== "production") {
      return await nodemailer.createTestAccount().then((testAccount) => {
        console.log("\n========== ETHEREAL TEST ACCOUNT ==========");
        console.log("User:", testAccount.user);
        console.log("Pass:", testAccount.pass);
        console.log("Web Interface:", testAccount.web);
        console.log("==========================================\n");
        return nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      });
    }
    throw new Error(
      "SMTP credentials not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS environment variables."
    );
  }

  // Production: use provided SMTP credentials
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
) {
  const transporter = await createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@journalme.com",
    to: email,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p>
        <a href="${resetUrl}?token=${resetToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link: ${resetUrl}?token=${resetToken}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("\n✓ Password reset email sent!");
    console.log("Message ID:", info.messageId);

    // For Ethereal test emails, show preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log("\n📧 Preview email at:", nodemailer.getTestMessageUrl(info));
    }
    console.log("");

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    throw err;
  }
}
