import request from "supertest";
import express from "express";
import authRouter from "../routes/auth";
import prisma from "../db";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

const TEST_EMAIL = `test+${Date.now()}@local`;
const TEST_PASS = "somestrongpassword";

beforeAll(async () => {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL must be set for integration tests");
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { contains: "test+" } } });
  await prisma.$disconnect();
});

test("POST /api/auth/register creates a user and returns token", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email: TEST_EMAIL, password: TEST_PASS });
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("token");
  expect(res.body.user).toHaveProperty("id");

  const dbUser = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  expect(dbUser).not.toBeNull();
});

test("POST /api/auth/register returns 409 for existing user", async () => {
  // attempt to register same email again
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email: TEST_EMAIL, password: TEST_PASS });
  expect(res.status).toBe(409);
});

test("POST /api/auth/login works for newly created user", async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: TEST_EMAIL, password: TEST_PASS });
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("token");
  expect(res.body.user).toHaveProperty("id");
});
