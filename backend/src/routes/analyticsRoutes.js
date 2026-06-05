const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public analytics endpoints (read-only)
router.get('/stats/repository-distribution', analyticsController.getRepositoryDistribution);
router.get('/stats/language-metrics', analyticsController.getLanguageMetrics);
router.get('/stats/overview', analyticsController.getOverallStats);

// Analytics Analysis endpoints matching "/analytics/datasets/*"
router.get('/datasets/type-analysis', analyticsController.getTypeAnalysis);
router.get('/datasets/repo-analysis', analyticsController.getRepoAnalysis);
router.get('/datasets/source-analysis', analyticsController.getSourceAnalysis);
router.get('/datasets/framework-analysis', analyticsController.getFrameworkAnalysis);
router.get('/datasets/language-analysis', analyticsController.getLanguageAnalysis);
router.get('/datasets/code-analysis', analyticsController.getCodeAnalysis);
router.get('/datasets/doc-analysis', analyticsController.getDocAnalysis);
router.get('/datasets/readme-analysis', analyticsController.getReadmeAnalysis);
router.get('/datasets/ml-analysis', analyticsController.getMlAnalysis);
router.get('/datasets/ai-analysis', analyticsController.getAiAnalysis);

// Protected bulk import endpoint (Admin only)
router.post(
  '/bulk-import',
  authMiddleware.protect,
  authMiddleware.restrictTo('admin'),
  analyticsController.bulkImport
);

module.exports = router;
