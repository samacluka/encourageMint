var User        = require("../models/user");

var is = {};

is.LoggedIn = function(req,res,next){
  if(process.env.NODE_ENV=="development"){ return next(); } // Skip middleware if in development mode

  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect("/auth/google");
  }
}

module.exports = is;
