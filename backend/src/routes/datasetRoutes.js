const express = require('express');
const datasetController = require('../controllers/datasetController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { createDatasetSchema, updateDatasetSchema } = require('../validations/schemas');

const router = express.Router();

router
  .route('/')
  .get(datasetController.getAllDatasets)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    validate(createDatasetSchema),
    datasetController.createDataset
  );

router
  .route('/:id')
  .get(datasetController.getDataset)
  .put(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    validate(updateDatasetSchema),
    datasetController.updateDataset
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    datasetController.deleteDataset
  );

module.exports = router;
