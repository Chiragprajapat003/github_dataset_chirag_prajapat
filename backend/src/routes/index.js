const express = require('express');
const router = express.Router();

// Import individual route modules
const authRoutes = require('./authRoutes');

// Mount routes
router.use('/auth', authRoutes);

module.exports = router;
