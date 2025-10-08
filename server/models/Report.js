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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  generatedAt: {
    type: Date
  }
});

// Index for better query performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);
