var mongoose = require("mongoose");

var User = require('./plant.js');

var defaultSchema = new mongoose.Schema({
  type: String,
  soilMoisture: {
    max: Number,
    min: Number
  },
  lightThreshold: {
    max: Number,
    min: Number
  }
}, { collection: 'Default' });

module.exports = mongoose.model("Default", defaultSchema);
