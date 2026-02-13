const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, comparePassword, createToken } = require('../services/authService');

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(409).json({ error: 'Utilisateur déjà existant' });

  const passwordHash = await hashPassword(password);
  const user = await User.create({ username, email, passwordHash, role: role || 'utilisateur' });
  res.status(201).json({ id: user._id, username: user.username, role: user.role });
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

  const token = createToken(user);
  res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ user: { id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role } });
});
