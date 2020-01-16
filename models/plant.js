var mongoose = require("mongoose");

var User = require('./user.js');

var plantSchema = new mongoose.Schema({
  Name: String,
  Type: String,
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
