const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const { hashPassword } = require('./services/authService');

async function seedAdmin() {
  const existing = await User.findOne({ username: env.seedAdmin.username });
  if (existing) return;
  const passwordHash = await hashPassword(env.seedAdmin.password);
  await User.create({
    username: env.seedAdmin.username,
    email: env.seedAdmin.email,
    passwordHash,
    role: 'admin'
  });
}

async function start() {
  await connectDB(env.mongoUri);
  await seedAdmin();
  app.listen(env.port, () => {
    console.log(`ONGConnect API démarrée sur http://localhost:${env.port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
