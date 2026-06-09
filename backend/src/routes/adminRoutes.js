const express = require('express');
const datasetController = require('../controllers/datasetController');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.options('/datasets', (req, res) => {
  res.setHeader('Allow', 'GET, OPTIONS, HEAD');
  res.status(200).send();
});

router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo('admin'));

router.get('/datasets', datasetController.getAllDatasets);
router.get('/analytics', analyticsController.getOverallStats);

module.exports = router;
