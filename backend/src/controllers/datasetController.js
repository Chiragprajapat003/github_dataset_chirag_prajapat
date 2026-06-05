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

// Helper for paginating custom queries
const sendPaginatedQuery = async (mongoQuery, req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const filter = mongoQuery.getFilter();
  const total = await Dataset.countDocuments(filter);
  
  // Apply sort if present in request query
  let finalQuery = mongoQuery.skip(skip).limit(limit);
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    finalQuery = finalQuery.sort(sortBy);
  }

  const datasets = await finalQuery.lean();

  res.status(200).json({
    status: 'success',
    results: datasets.length,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    },
    data: { datasets }
  });
};

exports.bulkCreate = catchAsync(async (req, res, next) => {
  const records = req.body.records || req.body;
  if (!Array.isArray(records)) {
    return next(new AppError('Please provide an array of records to bulk create', 400));
  }
  const result = await Dataset.insertMany(records);
  res.status(201).json({
    status: 'success',
    count: result.length,
    data: { datasets: result }
  });
});

exports.bulkUpdate = catchAsync(async (req, res, next) => {
  const updates = req.body.updates || req.body;
  if (!Array.isArray(updates)) {
    return next(new AppError('Please provide an array of updates', 400));
  }

  const bulkOps = updates.map(item => ({
    updateOne: {
      filter: item.recordId ? { recordId: item.recordId } : { _id: item.id },
      update: { $set: item.data || item },
      upsert: false
    }
  }));

  const result = await Dataset.bulkWrite(bulkOps);
  res.status(200).json({
    status: 'success',
    data: { result }
  });
});

exports.bulkDelete = catchAsync(async (req, res, next) => {
  const ids = req.body.ids || req.body;
  if (!Array.isArray(ids)) {
    return next(new AppError('Please provide an array of ids or recordIds to delete', 400));
  }

  const result = await Dataset.deleteMany({
    $or: [{ _id: { $in: ids } }, { recordId: { $in: ids } }]
  });

  res.status(200).json({
    status: 'success',
    count: result.deletedCount,
    data: { result }
  });
});

exports.checkExistence = catchAsync(async (req, res, next) => {
  const isObjectId = req.params.id.match(/^[0-9a-fA-F]{24}$/);
  const filter = isObjectId ? { _id: req.params.id } : { recordId: req.params.id };
  const exists = await Dataset.exists(filter);
  res.status(200).json({
    status: 'success',
    data: { exists: !!exists }
  });
});

exports.getByType = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.type': req.params.type });
  await sendPaginatedQuery(query, req, res);
});

exports.getByRepo = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.repo_name': req.params.repo });
  await sendPaginatedQuery(query, req, res);
});

exports.getBySource = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.source_type': req.params.source });
  await sendPaginatedQuery(query, req, res);
});

exports.getByDocType = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.doc_type': req.params.docType });
  await sendPaginatedQuery(query, req, res);
});

exports.getByCodeElement = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.code_element': req.params.element });
  await sendPaginatedQuery(query, req, res);
});

exports.getReadmeDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.is_readme': true });
  await sendPaginatedQuery(query, req, res);
});

exports.getFunctionDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [{ 'metadata.code_element': 'function' }, { 'metadata.type': /function/i }]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getClassDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [{ 'metadata.code_element': 'class' }, { 'metadata.type': /class/i }]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getDocumentationDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.type': 'documentation' });
  await sendPaginatedQuery(query, req, res);
});

exports.getGithubDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.source_type': 'github_repository' });
  await sendPaginatedQuery(query, req, res);
});

exports.getPythonDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { 'metadata.source_type': /python/i },
      { 'metadata.file_path': /\.py$/i },
      { instruction: /python/i },
      { output: /python/i }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getMlDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { instruction: /ml|machine learning|regression|classification|clustering/i },
      { output: /ml|machine learning|regression|classification|clustering/i }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getAiDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { instruction: /ai|artificial intelligence|nlp|deep learning|neural network|transformers/i },
      { output: /ai|artificial intelligence|nlp|deep learning|neural network|transformers/i }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getCodeGenDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    'metadata.type': /code_generation|implementation|function_implementation|class_implementation/i
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getDocstringsDatasets = catchAsync(async (req, res, next) => {
  const query = Dataset.find({ 'metadata.type': /docstring/i });
  await sendPaginatedQuery(query, req, res);
});

exports.getByTask = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { instruction: new RegExp(req.params.task, 'i') },
      { output: new RegExp(req.params.task, 'i') }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getByModel = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { instruction: new RegExp(req.params.model, 'i') },
      { output: new RegExp(req.params.model, 'i') }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getByFramework = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { instruction: new RegExp(req.params.framework, 'i') },
      { output: new RegExp(req.params.framework, 'i') }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getByLibrary = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { 'metadata.repo_name': new RegExp(req.params.library, 'i') },
      { instruction: new RegExp(req.params.library, 'i') }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getByLanguage = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { 'metadata.source_type': new RegExp(req.params.language, 'i') },
      { 'metadata.file_path': new RegExp('\\.' + req.params.language + '$', 'i') },
      { instruction: new RegExp(req.params.language, 'i') }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getByCategory = catchAsync(async (req, res, next) => {
  const query = Dataset.find({
    $or: [
      { 'metadata.type': new RegExp(req.params.category, 'i') },
      { instruction: new RegExp(req.params.category, 'i') }
    ]
  });
  await sendPaginatedQuery(query, req, res);
});

exports.getRandomDataset = catchAsync(async (req, res, next) => {
  const random = await Dataset.aggregate([{ $sample: { size: 1 } }]);
  if (!random.length) {
    return next(new AppError('No datasets found', 404));
  }
  res.status(200).json({ status: 'success', data: { dataset: random[0] } });
});

exports.getTrendingDatasets = catchAsync(async (req, res, next) => {
  const datasets = await Dataset.find().sort({ createdAt: -1 }).limit(10).lean();
  res.status(200).json({ status: 'success', data: { datasets } });
});

exports.getRecentDatasets = catchAsync(async (req, res, next) => {
  const datasets = await Dataset.find().sort({ createdAt: -1 }).limit(10).lean();
  res.status(200).json({ status: 'success', data: { datasets } });
});

exports.getRecommendations = catchAsync(async (req, res, next) => {
  // Simple recommendation: return 5 random records
  const datasets = await Dataset.aggregate([{ $sample: { size: 5 } }]);
  res.status(200).json({ status: 'success', data: { datasets } });
});

