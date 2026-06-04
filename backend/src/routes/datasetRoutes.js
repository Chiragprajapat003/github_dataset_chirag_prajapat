const express = require('express');
const datasetController = require('../controllers/datasetController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(datasetController.getAllDatasets)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    datasetController.createDataset
  );

router
  .route('/:id')
  .get(datasetController.getDataset)
  .put(
    authController.protect,
    authController.restrictTo('admin'),
    datasetController.updateDataset
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    datasetController.deleteDataset
  );

module.exports = router;
