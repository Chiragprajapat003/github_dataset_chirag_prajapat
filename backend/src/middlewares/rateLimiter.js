const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Global API Rate Limiter
 * 
 * Limits each IP to a configurable number of requests per time window.
 * Prevents brute-force attacks, DDoS, and API abuse.
 * 
 * Default: 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 'fail',
    message: config.rateLimit.message
  },
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false     // Disable the `X-RateLimit-*` headers
});

/**
 * Strict Rate Limiter for Authentication Routes
 * 
 * More aggressive limiting on login/register to prevent brute-force attacks.
 * Default: 20 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 'fail',
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes!'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter };
