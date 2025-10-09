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
    default: true
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
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
reportSchema.index({ isPublic: 1, averageRating: -1 });

// Method to calculate average rating
reportSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = (sum / this.ratings.length).toFixed(1);
    this.totalRatings = this.ratings.length;
  }
};

module.exports = mongoose.model('Report', reportSchema);
