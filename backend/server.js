require('dotenv').config();
const mongoose = require('mongoose');
// Import Express app
const app = require('./src/app');

// Define PORT
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/github-dataset')
  .then(() => {
    console.log('✅ Successfully connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections (e.g., failed DB connection outside of initial connect)
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
