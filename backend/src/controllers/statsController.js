const Dataset = require('../models/datasetModel');
const catchAsync = require('../utils/catchAsync');

exports.getCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments();
  res.status(200).json({ status: 'success', data: { count } });
});

exports.getFunctionsCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({
    $or: [{ 'metadata.code_element': 'function' }, { 'metadata.type': /function/i }]
  });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.getClassesCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({
    $or: [{ 'metadata.code_element': 'class' }, { 'metadata.type': /class/i }]
  });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.getDocumentationCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({ 'metadata.type': 'documentation' });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.getReadmeCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({ 'metadata.is_readme': true });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.getReposCount = catchAsync(async (req, res, next) => {
  const repos = await Dataset.distinct('metadata.repo_name');
  res.status(200).json({ status: 'success', data: { count: repos.length } });
});

exports.getLanguagesCount = catchAsync(async (req, res, next) => {
  const languages = await Dataset.distinct('metadata.source_type');
  res.status(200).json({ status: 'success', data: { count: languages.length } });
});

exports.getFrameworksCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({
    $or: [
      { instruction: /pytorch|tensorflow|keras|jax|flax/i },
      { output: /pytorch|tensorflow|keras|jax|flax/i }
    ]
  });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.getGithubCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({ 'metadata.source_type': 'github_repository' });
  res.status(200).json({ status: 'success', data: { count } });
});

exports.getAiCount = catchAsync(async (req, res, next) => {
  const count = await Dataset.countDocuments({
    $or: [
      { instruction: /ai|ml|machine learning|deep learning|nlp|neural network|transformers/i },
      { output: /ai|ml|machine learning|deep learning|nlp|neural network|transformers/i }
    ]
  });
  res.status(200).json({ status: 'success', data: { count } });
});
