const { body } = require('express-validator');

const registerValidator = [
  body('username').isLength({ min: 3 }).withMessage('username requis (min 3)'),
  body('email').isEmail().withMessage('email invalide'),
  body('password').isLength({ min: 8 }).withMessage('mot de passe min 8 caractères')
];

const loginValidator = [
  body('username').notEmpty().withMessage('username requis'),
  body('password').notEmpty().withMessage('mot de passe requis')
];

module.exports = { registerValidator, loginValidator };
