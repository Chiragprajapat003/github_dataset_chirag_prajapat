require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./src/config');

// Import Express app
const app = require('./src/app');

const path = require('path');
const fs = require('fs');
const Dataset = require('./src/models/datasetModel');

const autoImportData = async () => {
  try {
    const count = await Dataset.countDocuments();
    if (count === 0) {
      console.log('🔄 Database is empty. Initiating automatic dataset import...');
      const datasetFilePath = path.join(__dirname, '../../GITHUB dataset.json');
      if (fs.existsSync(datasetFilePath)) {
        const rawData = fs.readFileSync(datasetFilePath, 'utf-8');
        const records = JSON.parse(rawData);
        let dataArray = Array.isArray(records) ? records : [records];
        
        dataArray = dataArray.map(record => {
          if (record.id && !record.recordId) {
            record.recordId = record.id;
          }
          return record;
        });

        console.log(`📦 Importing ${dataArray.length} records into database...`);
        const result = await Dataset.insertMany(dataArray, { ordered: false });
        console.log(`✅ Auto-import completed! Successfully imported ${result.length} records.`);
      } else {
        console.log(`⚠️ Dataset file not found at ${datasetFilePath}. Skipped auto-import.`);
      }
    }
  } catch (err) {
    if (err.writeErrors) {
      console.log(`⚠️ Auto-imported with ${err.result.nInserted} successes and ${err.writeErrors.length} duplicates skipped.`);
    } else {
      console.error('❌ Auto-import error:', err.message);
    }
  }
};

// Connect to MongoDB and start server
mongoose.connect(config.mongoUri)
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB');
    
    // Auto import dataset if DB is empty
    await autoImportData();
    
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
