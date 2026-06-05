const AppError = require('../utils/appError');

/**
 * Middleware factory that validates req.body against a Joi schema.
 * @param {Joi.Schema} schema - The Joi schema to validate against.
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

module.exports = validate;
