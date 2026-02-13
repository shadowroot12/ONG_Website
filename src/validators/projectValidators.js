const { body, param } = require('express-validator');

const projectCreateValidator = [
  body('titre').notEmpty().withMessage('titre requis'),
  body('description').optional().isString(),
  body('budget').optional().isFloat({ min: 0 }),
  body('dateDebut').optional().isISO8601(),
  body('dateFin').optional().isISO8601(),
  body('actif').optional().isBoolean()
];

const projectUpdateValidator = [
  param('id').isMongoId().withMessage('id invalide'),
  ...projectCreateValidator
];

module.exports = { projectCreateValidator, projectUpdateValidator };
