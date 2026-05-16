const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    throw new Error('JWT_SECRET or ADMIN_SECRET_KEY must be set');
  }

  return secret;
};

const generateToken = (id, role = 'user') =>
  jwt.sign({ id, role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

module.exports = { generateToken, getJwtSecret };
