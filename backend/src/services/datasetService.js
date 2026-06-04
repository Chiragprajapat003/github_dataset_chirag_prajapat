const Dataset = require('../models/datasetModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllDatasets = async (queryString = {}) => {
  // Build a count query with the same filters (but without pagination)
  const countFeatures = new APIFeatures(Dataset.find(), queryString)
    .filter()
    .search();
  const total = await Dataset.countDocuments(countFeatures.query.getFilter());

  // Build the main query with all features
  const features = new APIFeatures(Dataset.find(), queryString)
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const datasets = await features.query.lean();

  return {
    datasets,
    total,
    page: features.page,
    limit: features.limit,
    totalPages: Math.ceil(total / features.limit)
  };
};

exports.getDatasetById = async (id) => {
  // Check if it's a MongoDB ObjectId or a recordId
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  if (isObjectId) {
    return await Dataset.findById(id);
  }
  return await Dataset.findOne({ recordId: id });
};

exports.createDataset = async (datasetData) => {
  return await Dataset.create(datasetData);
};

exports.updateDataset = async (id, updateData) => {
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { recordId: id };
  
  return await Dataset.findOneAndUpdate(query, updateData, {
    new: true,
    runValidators: true
  });
};

exports.deleteDataset = async (id) => {
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { recordId: id };
  
  return await Dataset.findOneAndDelete(query);
};
