var mongoose = require("mongoose");

var plantSchema = new mongoose.Schema({
  Name: String,
  Type: String,
  soilMoisture: {
    max: Number,
    min: Number
  },
  lightThreshold: {
    max: Number,
    min: Number
  }
});

module.exports = mongoose.model("Plant", plantSchema);
