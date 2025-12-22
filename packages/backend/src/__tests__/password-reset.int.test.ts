import request from "supertest";
import express from "express";
import authRouter from "../routes/auth";
import prisma from "../db";
import bcrypt from "bcrypt";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

const TEST_EMAIL = `password-reset+${Date.now()}@local`;
const TEST_PASS = "strongpassword123";

beforeAll(async () => {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL must be set for integration tests");
});

afterAll(async () => {
  // Clean up test users
  await prisma.user.deleteMany({
    where: { email: { contains: "password-reset+" } },
  });
  await prisma.$disconnect();
});

test("POST /api/auth/forgot-password sends reset link for existing user", async () => {
  // First register a user
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email: TEST_EMAIL, password: TEST_PASS });
  expect(registerRes.status).toBe(201);

  // Request password reset
  const resetRes = await request(app)
    .post("/api/auth/forgot-password")
    .send({ email: TEST_EMAIL });

  expect(resetRes.status).toBe(200);
  expect(resetRes.body).toHaveProperty("message");

  // Verify that reset token was saved in database
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  expect(user?.resetToken).not.toBeNull();
  expect(user?.resetTokenExpiry).not.toBeNull();
}, 15000); // 15 second timeout for email sending

test("POST /api/auth/forgot-password returns 200 for non-existent user (security)", async () => {
  const resetRes = await request(app)
    .post("/api/auth/forgot-password")
    .send({ email: "nonexistent@example.com" });

  // Should return 200 for security reasons (don't reveal if user exists)
  expect(resetRes.status).toBe(200);
  expect(resetRes.body).toHaveProperty("message");
});

test("POST /api/auth/reset-password resets password with valid token", async () => {
  const testEmail = `password-reset-valid+${Date.now()}@local`;
  const oldPassword = "oldpassword123";
  const newPassword = "newpassword123";

  // Register a user
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email: testEmail, password: oldPassword });
  expect(registerRes.status).toBe(201);

  // Request password reset
  const resetReqRes = await request(app)
    .post("/api/auth/forgot-password")
    .send({ email: testEmail });
  expect(resetReqRes.status).toBe(200);

  // Get the reset token from database
  const userWithToken = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  expect(userWithToken?.resetToken).not.toBeNull();

  // For testing, we need to get the actual token before hashing
  // In real scenario, the token is sent via email
  // We'll create a new user with a known token for testing
  const testToken = "test-reset-token-12345";
  const testUser = await prisma.user.create({
    data: {
      email: `token-test+${Date.now()}@local`,
      passwordHash: await bcrypt.hash(oldPassword, 10),
      resetToken: await bcrypt.hash(testToken, 10),
      resetTokenExpiry: new Date(Date.now() + 3600000), // 1 hour from now
    },
  });

  // Reset password with token
  const resetRes = await request(app)
    .post("/api/auth/reset-password")
    .send({ token: testToken, newPassword });

  expect(resetRes.status).toBe(200);
  expect(resetRes.body).toHaveProperty("message");

  // Verify password was changed
  const updatedUser = await prisma.user.findUnique({
    where: { id: testUser.id },
  });
  expect(updatedUser?.resetToken).toBeNull();
  expect(updatedUser?.resetTokenExpiry).toBeNull();

  // Verify new password works
  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: testUser.email, password: newPassword });
  expect(loginRes.status).toBe(200);
  expect(loginRes.body).toHaveProperty("token");

  // Clean up
  await prisma.user.delete({ where: { id: testUser.id } });
}, 15000); // 15 second timeout for email sending

test("POST /api/auth/reset-password rejects expired token", async () => {
  const testToken = "expired-token-12345";
  const testUser = await prisma.user.create({
    data: {
      email: `expired-token+${Date.now()}@local`,
      passwordHash: await bcrypt.hash("oldpass123", 10),
      resetToken: await bcrypt.hash(testToken, 10),
      resetTokenExpiry: new Date(Date.now() - 1000), // Expired 1 second ago
    },
  });

  const resetRes = await request(app)
    .post("/api/auth/reset-password")
    .send({ token: testToken, newPassword: "newpass123" });

  expect(resetRes.status).toBe(400);
  expect(resetRes.body.error).toContain("Invalid or expired");

  // Clean up
  await prisma.user.delete({ where: { id: testUser.id } });
});

test("POST /api/auth/reset-password requires password to be at least 8 characters", async () => {
  const testToken = "some-token-123";
  const testUser = await prisma.user.create({
    data: {
      email: `short-pass+${Date.now()}@local`,
      passwordHash: await bcrypt.hash("oldpass123", 10),
      resetToken: await bcrypt.hash(testToken, 10),
      resetTokenExpiry: new Date(Date.now() + 3600000),
    },
  });

  const resetRes = await request(app)
    .post("/api/auth/reset-password")
    .send({ token: testToken, newPassword: "short" });

  expect(resetRes.status).toBe(400);
  expect(resetRes.body.error).toContain("at least 8 characters");

  // Clean up
  await prisma.user.delete({ where: { id: testUser.id } });
});
