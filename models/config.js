var mongoose = require("mongoose");

var Plant = require('./plant.js');

var configSchema = new mongoose.Schema({
  mc: String,
  ip: String,
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
  created: { type: Date, default: Date.now }
}, { collection: 'Config' });

module.exports = mongoose.model("Config", configSchema);
