const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Request Logger Middleware
 * 
 * Uses Morgan for HTTP request logging.
 * - Development: Colored, concise output to console.
 * - Production: Apache-style logs written to file (logs/access.log).
 */

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for production logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }  // append mode
);

/**
 * Returns the appropriate Morgan middleware based on environment.
 */
const getLogger = () => {
  if (config.env === 'production') {
    // Production: log to file in Apache combined format
    return morgan('combined', { stream: accessLogStream });
  }
  // Development: log to console with colors
  return morgan('dev');
};

module.exports = getLogger;
