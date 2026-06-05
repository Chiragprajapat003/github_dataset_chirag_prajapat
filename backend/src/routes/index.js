const express = require('express');
const router = express.Router();

// Import individual route modules
const authRoutes = require('./authRoutes');
const datasetRoutes = require('./datasetRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const statsRoutes = require('./statsRoutes');
const jwtRoutes = require('./jwtRoutes');
const middlewareRoutes = require('./middlewareRoutes');
const searchRoutes = require('./searchRoutes');
const adminRoutes = require('./adminRoutes');
const protectedRoutes = require('./protectedRoutes');

// Mount routes under /api/v1
router.use('/auth', authRoutes);
router.use('/datasets', datasetRoutes);
router.use('/datasets', analyticsRoutes); // Legacy or stats sub-paths
router.use('/analytics', analyticsRoutes); // New analytics paths
router.use('/stats/datasets', statsRoutes);
router.use('/jwt', jwtRoutes);
router.use('/middleware', middlewareRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);
router.use('/protected', protectedRoutes);

module.exports = router;
