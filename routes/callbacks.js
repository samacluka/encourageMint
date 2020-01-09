const rootDir = "../";

const passport        = require("passport");

const User            = require(rootDir+"models/user.js");

var callbacks = {
  auth: {
    // logout
    google: {
      // index
      // callback
      // success
    },
  },
  index: {
      get: {
        // index
      },
      post: {
        // register
      }
  },
  controller: {
    get: {
      // setpoints
    },
    put: {
      // logs
    }
  },
};

// ======================================== AUTH ========================================
// LOGOUT
callbacks.auth.logout = function(req,res){
  req.logout();
  req.flash("success","Successfully logged out!");
  res.redirect("/");
};

//GOOGLE
callbacks.auth.google.index = passport.authenticate('google', {
  scope: ['profile']
});

callbacks.auth.google.callback = passport.authenticate('google', {
  failureFlash:    'Authentication failed',
  failureRedirect: '/auth'
});

callbacks.auth.google.success = function(req,res){
  req.flash("success","Successfully logged in!");
  res.redirect("/");
};

// ======================================== CONTROLLER ========================================
// GET
callbacks.controller.get.setpoints = function(req,res){
  res.send("setpoints");
}

// PUT
callbacks.controller.put.logs = function(req,res){
  res.send("logs");
}

// ======================================== EXPORT ========================================
module.exports = callbacks;
