const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');
const { registerSchema, loginSchema } = require('../validations/schemas');

const router = express.Router();

// Apply stricter rate limiting on auth routes (20 req/15min)
router.use(authLimiter);

router.post('/register', validate(registerSchema), authController.register);
router.options('/login', (req, res) => {
  res.setHeader('Allow', 'POST, OPTIONS, HEAD');
  res.status(200).send();
});
router.post('/login', validate(loginSchema), authController.login);

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/logout', authController.logout);
router.get('/profile', authMiddleware.protect, authController.getProfile);
router.patch('/profile', authMiddleware.protect, authController.updateProfile);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/send-otp', authController.sendOtp);
router.post('/change-password', authMiddleware.protect, authController.changePassword);

module.exports = router;
