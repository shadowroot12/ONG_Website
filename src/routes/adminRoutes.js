const router = require('express').Router();
const adminController = require('../controllers/adminController');
const projectController = require('../controllers/projectController');
const donationController = require('../controllers/donationController');
const beneficiaryController = require('../controllers/beneficiaryController');
const validate = require('../middleware/validateMiddleware');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { projectCreateValidator, projectUpdateValidator } = require('../validators/projectValidators');
const { beneficiaryCreateValidator, beneficiaryDeleteValidator } = require('../validators/beneficiaryValidators');

router.use(authenticate);
router.get('/stats', adminController.getStats);
router.get('/report', adminController.getReport);

router.get('/projects', projectController.getAdminProjects);
router.post('/projects', authorize('admin', 'utilisateur'), upload.single('image'), projectCreateValidator, validate, projectController.createProject);
router.put('/projects/:id', authorize('admin', 'utilisateur'), upload.single('image'), projectUpdateValidator, validate, projectController.updateProject);
router.delete('/projects/:id', authorize('admin'), projectController.deleteProject);

router.get('/donations', donationController.getAdminDonations);

router.get('/beneficiaries', beneficiaryController.getBeneficiaries);
router.post('/beneficiaries', authorize('admin', 'utilisateur'), beneficiaryCreateValidator, validate, beneficiaryController.createBeneficiary);
router.delete('/beneficiaries/:id', authorize('admin'), beneficiaryDeleteValidator, validate, beneficiaryController.deleteBeneficiary);

module.exports = router;
