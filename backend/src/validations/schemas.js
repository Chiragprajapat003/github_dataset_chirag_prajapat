const Joi = require('joi');

/**
 * Validation schema for creating a new dataset record.
 */
exports.createDatasetSchema = Joi.object({
  recordId: Joi.string().required().messages({
    'string.base': 'Record ID must be a string',
    'string.empty': 'Record ID cannot be empty',
    'any.required': 'Record ID is required'
  }),
  instruction: Joi.string().required().messages({
    'string.base': 'Instruction must be a string',
    'string.empty': 'Instruction cannot be empty',
    'any.required': 'Instruction is required'
  }),
  input: Joi.string().allow('').default('').messages({
    'string.base': 'Input must be a string'
  }),
  output: Joi.string().required().messages({
    'string.base': 'Output must be a string',
    'string.empty': 'Output cannot be empty',
    'any.required': 'Output is required'
  }),
  metadata: Joi.object({
    type: Joi.string().required().messages({
      'string.base': 'Metadata type must be a string',
      'string.empty': 'Metadata type cannot be empty',
      'any.required': 'Metadata type is required'
    }),
    code_element: Joi.string().allow('', null).messages({
      'string.base': 'Code element must be a string'
    }),
    repo_name: Joi.string().allow('', null).messages({
      'string.base': 'Repository name must be a string'
    }),
    file_path: Joi.string().allow('', null).messages({
      'string.base': 'File path must be a string'
    }),
    source_type: Joi.string().allow('', null).messages({
      'string.base': 'Source type must be a string'
    }),
    doc_type: Joi.string().allow('', null).messages({
      'string.base': 'Document type must be a string'
    }),
    is_readme: Joi.boolean().default(false).messages({
      'boolean.base': 'is_readme must be a boolean'
    })
  }).required().messages({
    'any.required': 'Metadata object is required'
  })
});

/**
 * Validation schema for updating a dataset record.
 * All fields are optional on update.
 */
exports.updateDatasetSchema = Joi.object({
  recordId: Joi.string().messages({
    'string.base': 'Record ID must be a string',
    'string.empty': 'Record ID cannot be empty'
  }),
  instruction: Joi.string().messages({
    'string.base': 'Instruction must be a string',
    'string.empty': 'Instruction cannot be empty'
  }),
  input: Joi.string().allow('').messages({
    'string.base': 'Input must be a string'
  }),
  output: Joi.string().messages({
    'string.base': 'Output must be a string',
    'string.empty': 'Output cannot be empty'
  }),
  metadata: Joi.object({
    type: Joi.string().messages({
      'string.base': 'Metadata type must be a string',
      'string.empty': 'Metadata type cannot be empty'
    }),
    code_element: Joi.string().allow('', null).messages({
      'string.base': 'Code element must be a string'
    }),
    repo_name: Joi.string().allow('', null).messages({
      'string.base': 'Repository name must be a string'
    }),
    file_path: Joi.string().allow('', null).messages({
      'string.base': 'File path must be a string'
    }),
    source_type: Joi.string().allow('', null).messages({
      'string.base': 'Source type must be a string'
    }),
    doc_type: Joi.string().allow('', null).messages({
      'string.base': 'Document type must be a string'
    }),
    is_readme: Joi.boolean().messages({
      'boolean.base': 'is_readme must be a boolean'
    })
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
