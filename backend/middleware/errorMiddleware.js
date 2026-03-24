// Global error handler
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';

  if (err.name === 'CastError')       { statusCode = 400; message = `Invalid ${err.path}: ${err.value}`; }
  if (err.code  === 11000)            { statusCode = 400; const field = Object.keys(err.keyValue)[0]; message = `${field} already exists`; }
  if (err.name === 'ValidationError') { statusCode = 400; message = Object.values(err.errors).map(v => v.message).join(', '); }

  if (process.env.NODE_ENV === 'development') console.error('ERROR:', err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async wrapper - no need for try/catch in every controller
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
