const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Protect - requires valid JWT
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select('-password');
    if (!user)       return res.status(401).json({ success: false, message: 'User not found.' });
    if (user.isBanned) return res.status(403).json({ success: false, message: `Account banned: ${user.banReason || 'Policy violation'}` });
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    next(error);
  }
};

// Role-based access
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: `Access denied. Requires: ${roles.join(' or ')}` });
  }
  next();
};

module.exports = { protect, authorize };
