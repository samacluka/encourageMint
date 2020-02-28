var mongoose = require("mongoose");

var Plant = require('./plant.js');
var User = require('./user.js');

var messageSchema = new mongoose.Schema({
  message: String,
  type: String,
  plant: { type: mongoose.Schema.Types.ObjectId, ref: 'Plant' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date, default: Date.now }
}, { collection: 'Message' });

module.exports = mongoose.model("Message", messageSchema);
