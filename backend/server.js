require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./src/config');

// Import Express app
const app = require('./src/app');

// Connect to MongoDB and start server
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port} [${config.env}]`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
