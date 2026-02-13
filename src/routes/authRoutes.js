const router = require('express').Router();
const controller = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidators');

router.post('/register', authenticate, authorize('admin'), registerValidator, validate, controller.register);
router.post('/login', loginValidator, validate, controller.login);
router.get('/me', authenticate, controller.me);

module.exports = router;
