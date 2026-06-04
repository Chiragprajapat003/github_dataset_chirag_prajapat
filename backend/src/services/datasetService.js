const Dataset = require('../models/datasetModel');

exports.getAllDatasets = async (query = {}) => {
  return await Dataset.find(query);
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
