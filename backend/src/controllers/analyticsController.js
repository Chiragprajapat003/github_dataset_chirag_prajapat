const analyticsService = require('../services/analyticsService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getRepositoryDistribution = catchAsync(async (req, res, next) => {
  const stats = await analyticsService.getRepositoryDistribution();

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats
    }
  });
});

exports.getLanguageMetrics = catchAsync(async (req, res, next) => {
  const stats = await analyticsService.getLanguageMetrics();

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats
    }
  });
});

exports.getOverallStats = catchAsync(async (req, res, next) => {
  const stats = await analyticsService.getOverallStats();

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.bulkImport = catchAsync(async (req, res, next) => {
  if (!req.body.records || !Array.isArray(req.body.records)) {
    return next(new AppError('Please provide an array of records in the request body', 400));
  }

  if (req.body.records.length === 0) {
    return next(new AppError('Records array cannot be empty', 400));
  }

  const result = await analyticsService.bulkImport(req.body.records, req.user._id);

  res.status(201).json({
    status: 'success',
    message: `${result.insertedCount} records imported successfully`,
    data: {
      insertedCount: result.insertedCount
    }
  });
});
