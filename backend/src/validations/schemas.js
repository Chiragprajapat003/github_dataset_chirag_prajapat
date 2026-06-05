const Joi = require('joi');

/**
 * Validation schema for creating a new dataset record.
 */
exports.createDatasetSchema = Joi.object({
  recordId: Joi.string().required().messages({
    'string.empty': 'Record ID cannot be empty',
    'any.required': 'Record ID is required'
  }),
  instruction: Joi.string().required().messages({
    'string.empty': 'Instruction cannot be empty',
    'any.required': 'Instruction is required'
  }),
  input: Joi.string().allow('').default(''),
  output: Joi.string().required().messages({
    'string.empty': 'Output cannot be empty',
    'any.required': 'Output is required'
  }),
  metadata: Joi.object({
    type: Joi.string().required().messages({
      'any.required': 'Metadata type is required'
    }),
    code_element: Joi.string().allow('', null),
    repo_name: Joi.string().allow('', null),
    file_path: Joi.string().allow('', null),
    source_type: Joi.string().allow('', null),
    doc_type: Joi.string().allow('', null),
    is_readme: Joi.boolean().default(false)
  }).required().messages({
    'any.required': 'Metadata object is required'
  })
});

/**
 * Validation schema for updating a dataset record.
 * All fields are optional on update.
 */
exports.updateDatasetSchema = Joi.object({
  recordId: Joi.string(),
  instruction: Joi.string(),
  input: Joi.string().allow(''),
  output: Joi.string(),
  metadata: Joi.object({
    type: Joi.string(),
    code_element: Joi.string().allow('', null),
    repo_name: Joi.string().allow('', null),
    file_path: Joi.string().allow('', null),
    source_type: Joi.string().allow('', null),
    doc_type: Joi.string().allow('', null),
    is_readme: Joi.boolean()
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validation schema for user registration.
 */
exports.registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('user', 'admin').default('user')
});

/**
 * Validation schema for user login.
 */
exports.loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});
