const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const signupValidation = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscores only'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password required'),
];

const postValidation = [
  body('caption').optional().isLength({ max: 2000 }).withMessage('Caption max 2000 characters'),
];

const commentValidation = [
  body('text').trim().notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 500 }).withMessage('Comment max 500 characters'),
];

const profileValidation = [
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio max 200 characters'),
  body('name').optional().isLength({ max: 50 }).withMessage('Name max 50 characters'),
];

module.exports = { validate, signupValidation, loginValidation, postValidation, commentValidation, profileValidation };
