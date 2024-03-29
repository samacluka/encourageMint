var mongoose = require("mongoose");

var User = require('./user.js');
var Log = require('./log.js');

var plantSchema = new mongoose.Schema({
  Name: String,
  Type: String,
  mc: String,
  Owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soilMoisture: {
    max: Number,
    min: Number
  },
  lightThreshold: {
    max: Number,
    min: Number
  }
}, { collection: 'Plant' });

module.exports = mongoose.model("Plant", plantSchema);
