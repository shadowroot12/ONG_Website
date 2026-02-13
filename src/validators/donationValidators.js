const { body } = require('express-validator');

const donationCreateValidator = [
  body('montant').isFloat({ min: 1 }).withMessage('montant invalide'),
  body('projet').isMongoId().withMessage('projet invalide'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('email invalide'),
  body('anonyme').optional().isBoolean()
];

module.exports = { donationCreateValidator };
