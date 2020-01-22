const rootDir = "../";

const passport        = require("passport");

const User            = require(rootDir+"models/user.js"),
      Plant           = require(rootDir+"models/plant.js"),
      Log             = require(rootDir+"models/log.js");

const views           = require(rootDir+"views/views.js");

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
  failureRedirect: '/auth'
});

callbacks.auth.google.success = function(req,res){
  res.redirect("/");
};

// ======================================== INDEX ========================================
// GET
callbacks.index.get.index = function(req,res){
  Log.find({}, (err, logs) => {
    if(err){
      console.log(err);
    } else {
      res.render(views.index.home, {logs: logs});
    }
  });
};

// ======================================== CONTROLLER ========================================
// GET
callbacks.controller.get.setpoints = function(req,res){
  // Read setpoints from data base given query params (req.body)
  // Return query results
  Plant.findById(req.body.plantid, (err, foundPlant) => {
    if(err || !foundPlant){
      console.log("err: "+err);
    } else {
      res.send(JSON.stringify(foundPlant));
    }
  });
  // res.render(views.controller.getSetpoints);
};

// PUT
callbacks.controller.put.logs = function(req,res){
  var logObj = {
    temperature: req.body.temperature,
    humidity: req.body.humidity,
    soilMoisture: req.body.soilMoisture,
    light: req.body.light,
    pumpTime: req.body.pumpTime
  };
  Log.countDocuments({}, (err, count) => {
    if(count >= 5){
      Log.deleteOne({}, (err) => { // Deletes oldest document (1)
        if(err){
          console.log(err);
        } else {
          Log.create(logObj,(err, newLog) => {
            if(err){
              console.log(err);
            } else {
              res.send("successfully logged");
            }
          });
        }
      });
    } else {
      Log.create(logObj,(err, newLog) => {
        if(err){
          console.log(err);
        } else {
          res.send("successfully logged");
        }
      });
    }
  });
};

// ======================================== EXPORT ========================================
module.exports = callbacks;
