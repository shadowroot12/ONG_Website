const router = require('express').Router();
const publicController = require('../controllers/publicController');
const donationController = require('../controllers/donationController');
const projectController = require('../controllers/projectController');
const validate = require('../middleware/validateMiddleware');
const { donationCreateValidator } = require('../validators/donationValidators');

router.get('/ngo', publicController.getNgoProfile);
router.get('/projects', projectController.getPublicProjects);
router.post('/donations', donationCreateValidator, validate, donationController.createDonation);

module.exports = router;
