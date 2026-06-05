/**
 * Centralized Configuration Module
 * 
 * All environment variables and application settings are managed here.
 * This provides a single source of truth for configuration across the app.
 */

const config = {
  // Server Configuration
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  // MongoDB Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/github-dataset',

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,  // max requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes!'
  },

  // Pagination Defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = config;
