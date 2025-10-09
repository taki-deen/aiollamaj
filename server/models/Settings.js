const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.index({ key: 1 });

settingsSchema.statics.get = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

settingsSchema.statics.set = async function(key, value, userId = null, description = '') {
  const setting = await this.findOneAndUpdate(
    { key },
    { 
      value, 
      description,
      updatedBy: userId,
      updatedAt: new Date()
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );
  return setting;
};

module.exports = mongoose.model('Settings', settingsSchema);

