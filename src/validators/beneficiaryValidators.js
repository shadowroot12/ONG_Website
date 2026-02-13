const { body, param } = require('express-validator');

const beneficiaryCreateValidator = [
  body('nom').notEmpty().withMessage('nom requis'),
  body('age').optional().isInt({ min: 0 }),
  body('localite').optional().isString(),
  body('projet').isMongoId().withMessage('projet invalide')
];

const beneficiaryDeleteValidator = [param('id').isMongoId().withMessage('id invalide')];

module.exports = { beneficiaryCreateValidator, beneficiaryDeleteValidator };
