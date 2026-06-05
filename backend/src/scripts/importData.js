/**
 * Dataset Import Script
 * 
 * This script reads a JSON file containing dataset records and imports them
 * into the MongoDB database using Mongoose's insertMany for optimal performance.
 * 
 * Usage:
 *   node src/scripts/importData.js --import <path-to-json-file>
 *   node src/scripts/importData.js --delete
 * 
 * Examples:
 *   node src/scripts/importData.js --import ./data/dataset.json
 *   node src/scripts/importData.js --delete
 */

require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Dataset = require('../models/datasetModel');

// Connect to MongoDB
const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/github-dataset';

mongoose.connect(DB).then(() => {
  console.log('✅ DB connection successful for import!');
});

// Read JSON file
const importData = async () => {
  try {
    const filePath = process.argv[3];
    
    if (!filePath) {
      console.log('❌ Please provide a file path: node importData.js --import <path>');
      process.exit(1);
    }

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const records = JSON.parse(rawData);

    // Handle both array and single-object formats
    const dataArray = Array.isArray(records) ? records : [records];

    console.log(`📦 Importing ${dataArray.length} records...`);

    const result = await Dataset.insertMany(dataArray, { ordered: false });
    console.log(`✅ Successfully imported ${result.length} records!`);
    process.exit(0);
  } catch (err) {
    if (err.writeErrors) {
      console.log(`⚠️  Imported with ${err.result.nInserted} successes and ${err.writeErrors.length} duplicates skipped.`);
    } else {
      console.error('❌ Import error:', err.message);
    }
    process.exit(1);
  }
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Dataset.deleteMany();
    console.log('🗑️  Data successfully deleted!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    process.exit(1);
  }
};

// Parse CLI arguments
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Usage:');
  console.log('  node src/scripts/importData.js --import <path-to-json>');
  console.log('  node src/scripts/importData.js --delete');
  process.exit(0);
}
