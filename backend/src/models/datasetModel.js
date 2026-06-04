const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true, index: true },
  instruction: { type: String, required: true },
  input: { type: String, default: "" },
  output: { type: String, required: true },
  metadata: {
    type: { type: String, required: true, index: true },
    code_element: { type: String },
    repo_name: { type: String, index: true },
    file_path: { type: String },
    source_type: { type: String, index: true },
    doc_type: { type: String },
    is_readme: { type: Boolean, default: false }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true 
});

// Text index for full-text search capabilities
DatasetSchema.index({ instruction: 'text', output: 'text', 'metadata.repo_name': 'text' });

module.exports = mongoose.model('Dataset', DatasetSchema);
