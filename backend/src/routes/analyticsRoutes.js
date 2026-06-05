const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public analytics endpoints (read-only)
router.get('/stats/repository-distribution', analyticsController.getRepositoryDistribution);
router.get('/stats/language-metrics', analyticsController.getLanguageMetrics);
router.get('/stats/overview', analyticsController.getOverallStats);

// Protected bulk import endpoint (Admin only)
router.post(
  '/bulk-import',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  analyticsController.bulkImport
);

module.exports = router;
