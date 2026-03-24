// authRoutes.js
const express = require('express');
const router  = express.Router();
const { signup, verifyEmail, resendOTP, login, forgotPassword, verifyResetOTP, resetPassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { signupValidation, loginValidation, validate } = require('../middleware/validationMiddleware');

// Health check for auth route
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Auth routes working' });
});

router.post('/signup',           signupValidation, validate, signup);
router.post('/verify-email',     verifyEmail);
router.post('/resend-otp',       resendOTP);
router.post('/login',            loginValidation, validate, login);
router.post('/forgot-password',  forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password',   resetPassword);
router.get('/me',                protect, getMe);

module.exports = router;
