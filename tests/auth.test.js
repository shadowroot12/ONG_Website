const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const User = require('../src/models/User');
const { hashPassword } = require('../src/services/authService');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const passwordHash = await hashPassword('admin12345');
  await User.create({ username: 'admin', email: 'admin@test.local', passwordHash, role: 'admin' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('login returns jwt token', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin12345' });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeTruthy();
});
