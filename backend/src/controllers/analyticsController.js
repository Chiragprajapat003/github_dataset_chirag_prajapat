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

exports.getTypeAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $group: { _id: '$metadata.type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getRepoAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $group: { _id: '$metadata.repo_name', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getSourceAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $group: { _id: '$metadata.source_type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getFrameworkAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    {
      $project: {
        framework: {
          $cond: {
            if: { $regexMatch: { input: '$instruction', regex: /pytorch/i } },
            then: 'PyTorch',
            else: {
              $cond: {
                if: { $regexMatch: { input: '$instruction', regex: /tensorflow/i } },
                then: 'TensorFlow',
                else: 'Other/Unknown'
              }
            }
          }
        }
      }
    },
    { $group: { _id: '$framework', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getLanguageAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $group: { _id: '$metadata.source_type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getCodeAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $match: { 'metadata.code_element': { $exists: true, $ne: null } } },
    { $group: { _id: '$metadata.code_element', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getDocAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $match: { 'metadata.doc_type': { $exists: true, $ne: null } } },
    { $group: { _id: '$metadata.doc_type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getReadmeAnalysis = catchAsync(async (req, res, next) => {
  const stats = await Dataset.aggregate([
    { $group: { _id: '$metadata.is_readme', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.getMlAnalysis = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({
    $or: [
      { instruction: /ml|machine learning|regression|classification/i },
      { output: /ml|machine learning|regression|classification/i }
    ]
  });
  res.status(200).json({
    status: 'success',
    data: {
      mlRecordCount: count,
      message: 'Machine Learning datasets analysis overview'
    }
  });
});

exports.getAiAnalysis = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({
    $or: [
      { instruction: /ai|artificial intelligence|nlp|deep learning|transformers/i },
      { output: /ai|artificial intelligence|nlp|deep learning|transformers/i }
    ]
  });
  res.status(200).json({
    status: 'success',
    data: {
      aiRecordCount: count,
      message: 'Artificial Intelligence datasets analysis overview'
    }
  });
});

