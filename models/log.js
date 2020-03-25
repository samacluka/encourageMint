var mongoose = require("mongoose");

var Plant = require('./plant.js');

var logSchema = new mongoose.Schema({
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
  created: { type: Date, default: Date.now },
  temperature: Number,
  humidity: Number,
  soilMoisture: Number,
  light: Number,
}, { collection: 'Log' });

module.exports = mongoose.model("Log", logSchema);
