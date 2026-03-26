const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, required: true, unique: true, trim: true,
      minlength: 3, maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String, required: true, unique: true, lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password:  { type: String, required: true, minlength: 6, select: false },
    name:      { type: String, trim: true, maxlength: 50 },
    bio:       { type: String, maxlength: 200, default: '' },
    profilePicture: { type: String, default: '' },
    role:      { type: String, enum: ['user', 'admin'], default: 'user' },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Email verification
    isEmailVerified:  { type: Boolean, default: true },
    emailOTP:         { type: String, select: false },
    emailOTPExpiry:   { type: Date,   select: false },

    // Password reset
    passwordResetOTP:       { type: String, select: false },
    passwordResetOTPExpiry: { type: Date,   select: false },

    // Account status
    isActive:  { type: Boolean, default: true },
    isBanned:  { type: Boolean, default: false },
    banReason: { type: String },

    socketId: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
