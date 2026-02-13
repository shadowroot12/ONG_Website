const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ongconnect',
  jwtSecret: process.env.JWT_SECRET || 'unsafe-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 10),
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  mail: {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 587),
    secure: String(process.env.MAIL_SECURE || 'false') === 'true',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM || 'ONGConnect <no-reply@ongconnect.org>'
  },
  seedAdmin: {
    username: process.env.ADMIN_SEED_USERNAME || 'admin',
    password: process.env.ADMIN_SEED_PASSWORD || 'admin123',
    email: process.env.ADMIN_SEED_EMAIL || 'admin@ongconnect.org'
  }
};
