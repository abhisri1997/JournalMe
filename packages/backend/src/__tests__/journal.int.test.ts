import request from 'supertest';
import express from 'express';
import journalRouter from '../routes/journal';
import authRouter from '../routes/auth';
import { authenticate } from '../middleware/auth';
import prisma from '../db';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/journals', authenticate, journalRouter);

let token: string;

beforeAll(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be set for integration tests');
  // login to get token
  const authRes = await request(app).post('/api/auth/login').send({ email: 'test@local', password: 'password' });
  token = authRes.body.token;
});

afterAll(async () => {
  // clean up test data
  await prisma.journalEntry.deleteMany();
  await prisma.$disconnect();
});

test('POST /api/journals creates a journal entry and persists it when authorized', async () => {
  const res = await request(app)
    .post('/api/journals')
    .set('Authorization', `Bearer ${token}`)
    .field('text', 'Integration test entry');
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
  expect(res.body.text).toBe('Integration test entry');

  // Check DB directly
  const dbEntry = await prisma.journalEntry.findUnique({ where: { id: res.body.id } });
  expect(dbEntry).not.toBeNull();
  expect(dbEntry?.text).toBe('Integration test entry');
});

test('POST /api/journals returns 401 when unauthorized', async () => {
  const res = await request(app).post('/api/journals').field('text', 'Should fail');
  expect(res.status).toBe(401);
});
