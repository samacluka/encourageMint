var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var Plant = require('./plant.js');

var userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  plants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plant' }],
  googleId: String,
}, { collection: 'User' });

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
