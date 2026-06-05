const express = require('express');
const jwtController = require('../controllers/jwtController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/generate-token', jwtController.generateToken);
router.post('/verify-token', jwtController.verifyToken);
router.post('/refresh-token', jwtController.refreshToken);
router.delete('/revoke-token', jwtController.revokeToken);

// Protected routes
router.get('/profile', authMiddleware.protect, jwtController.getProfile);
router.get('/dashboard', authMiddleware.protect, jwtController.getDashboard);
router.get('/private-datasets', authMiddleware.protect, jwtController.getPrivateDatasets);
router.get('/private-analytics', authMiddleware.protect, jwtController.getPrivateAnalytics);

module.exports = router;
