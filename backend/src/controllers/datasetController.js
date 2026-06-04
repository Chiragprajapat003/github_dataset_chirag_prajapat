const datasetService = require('../services/datasetService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllDatasets = catchAsync(async (req, res, next) => {
  const result = await datasetService.getAllDatasets(req.query);

  res.status(200).json({
    status: 'success',
    results: result.datasets.length,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    },
    data: {
      datasets: result.datasets
    }
  });
});

exports.getDataset = catchAsync(async (req, res, next) => {
  const dataset = await datasetService.getDatasetById(req.params.id);

  if (!dataset) {
    return next(new AppError('No dataset found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      dataset
    }
  });
});

exports.createDataset = catchAsync(async (req, res, next) => {
  // Attach user to record if available
  if (req.user) req.body.createdBy = req.user._id;

  const newDataset = await datasetService.createDataset(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      dataset: newDataset
    }
  });
});

exports.updateDataset = catchAsync(async (req, res, next) => {
  const dataset = await datasetService.updateDataset(req.params.id, req.body);

  if (!dataset) {
    return next(new AppError('No dataset found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      dataset
    }
  });
});

exports.deleteDataset = catchAsync(async (req, res, next) => {
  const dataset = await datasetService.deleteDataset(req.params.id);

  if (!dataset) {
    return next(new AppError('No dataset found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
