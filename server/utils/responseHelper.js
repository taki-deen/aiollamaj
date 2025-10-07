// Response helper utilities

/**
 * Send success response
 */
const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send error response
 */
const sendError = (res, message = 'Error occurred', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };
  
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error.message || error;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Handle async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(`Error in ${fn.name}:`, error);
    sendError(res, error.message || 'Internal server error', 500, error);
  });
};

/**
 * Validate required fields
 */
const validateRequiredFields = (fields, data) => {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field);
    }
  }
  return missing.length > 0 ? missing : null;
};

module.exports = {
  sendSuccess,
  sendError,
  asyncHandler,
  validateRequiredFields
};

