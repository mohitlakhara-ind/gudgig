import { validationResult } from 'express-validator';

// Validation error handling middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().reduce((acc, error) => {
        const field = error.param || error.path || 'unknown';
        if (!acc[field]) acc[field] = [];
        acc[field].push(error.msg);
        return acc;
      }, {})
    });
  }
  next();
};

// Generic validation middleware factory
export const validate = (validationRules) => {
  return [
    ...validationRules,
    handleValidationErrors
  ];
};

export default { handleValidationErrors, validate };