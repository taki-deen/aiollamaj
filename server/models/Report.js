const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  prompt: {
    type: String
  },
  generatedReport: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'error'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  generatedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Report', reportSchema);
