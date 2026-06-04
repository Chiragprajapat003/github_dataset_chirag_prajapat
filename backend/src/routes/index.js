const express = require('express');
const router = express.Router();

// Import individual route modules
const authRoutes = require('./authRoutes');
const datasetRoutes = require('./datasetRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/datasets', datasetRoutes);

module.exports = router;
