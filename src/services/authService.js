const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

async function hashPassword(password) {
  return bcrypt.hash(password, env.bcryptRounds);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function createToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, username: user.username }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { hashPassword, comparePassword, createToken, verifyToken };
