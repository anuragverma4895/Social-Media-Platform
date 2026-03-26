const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateOTP, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { asyncHandler } = require('../middleware/errorMiddleware');

// POST /api/auth/signup
const signup = asyncHandler(async (req, res) => {
  const { username, email, password, name } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? 'Email' : 'Username';
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  const user = await User.create({
    username, email, password,
    name: name || username,
    isEmailVerified: true, // Auto verify all accounts
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Account created successfully!',
    data: { 
      token, 
      user: { _id: user._id, username: user.username, email: user.email, name: user.name, profilePicture: user.profilePicture, role: user.role }
    },
  });
});

// POST /api/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const user = await User.findById(userId).select('+emailOTP +emailOTPExpiry');

  if (!user)                                return res.status(404).json({ success: false, message: 'User not found' });
  if (user.isEmailVerified)                 return res.status(400).json({ success: false, message: 'Email already verified' });
  if (!user.emailOTP || user.emailOTP !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
  if (new Date() > user.emailOTPExpiry)     return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });

  user.isEmailVerified  = true;
  user.emailOTP         = undefined;
  user.emailOTPExpiry   = undefined;
  await user.save();

  const token = generateToken(user._id, user.role);
  res.json({
    success: true,
    message: 'Email verified!',
    data: {
      token,
      user: { _id: user._id, username: user.username, email: user.email, name: user.name, profilePicture: user.profilePicture, role: user.role },
    },
  });
});

// POST /api/auth/resend-otp
const resendOTP = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.userId).select('+emailOTP +emailOTPExpiry');
  if (!user)                return res.status(404).json({ success: false, message: 'User not found' });
  if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Already verified' });

  const otp = generateOTP();
  user.emailOTP       = otp;
  user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendVerificationEmail(user.email, user.username, otp);

  res.json({ success: true, message: 'New OTP sent to your email.' });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const identifier = email ? email.trim() : '';
  const passStr = password ? String(password) : '';
  
  const user = await User.findOne({ 
    $or: [
      { email: { $regex: new RegExp(`^${identifier}$`, 'i') } }, 
      { username: { $regex: new RegExp(`^${identifier}$`, 'i') } }
    ] 
  }).select('+password');

  console.log(`[LOGIN DEBUG] Identifier: ${identifier}, User found: ${!!user}, Has password: ${!!user?.password}`);
  if (user) {
    const match = await user.comparePassword(passStr);
    console.log(`[LOGIN DEBUG] Password match: ${match}`);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  // Removed verify email check to allow login for everyone

  if (user.isBanned) {
    return res.status(403).json({ success: false, message: `Account banned: ${user.banReason || 'Policy violation'}` });
  }

  const token = generateToken(user._id, user.role);
  res.json({
    success: true,
    message: 'Login successful!',
    data: {
      token,
      user: { _id: user._id, username: user.username, email: user.email, name: user.name, bio: user.bio, profilePicture: user.profilePicture, role: user.role, followers: user.followers, following: user.following },
    },
  });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ success: true, message: 'If that email exists, we sent an OTP.' });

  const otp = generateOTP();
  user.passwordResetOTP       = otp;
  user.passwordResetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendPasswordResetEmail(user.email, user.username, otp);

  res.json({ success: true, message: 'Reset OTP sent to your email.', data: { userId: user._id } });
});

// POST /api/auth/verify-reset-otp
const verifyResetOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const user = await User.findById(userId).select('+passwordResetOTP +passwordResetOTPExpiry');

  if (!user || user.passwordResetOTP !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
  if (new Date() > user.passwordResetOTPExpiry) return res.status(400).json({ success: false, message: 'OTP expired' });

  res.json({ success: true, message: 'OTP verified. You can now reset your password.' });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Email and new password required' });
  
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'Password min 6 characters' });

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password reset successfully!' });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('followers', 'username profilePicture name')
    .populate('following', 'username profilePicture name');
  res.json({ success: true, data: user });
});

module.exports = { signup, verifyEmail, resendOTP, login, forgotPassword, verifyResetOTP, resetPassword, getMe };
