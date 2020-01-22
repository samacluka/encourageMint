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
  var time = new Date();
  time.setDate(time.getDate()-7)%30;
  Log.findOne({}, (err, logs) => {   /// FIND ONE FOR NOW ---> created: {$lt: time}
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
  try {
    var logObj = {
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      soilMoisture: req.body.soilMoisture,
      light: req.body.light,
      pumpTime: req.body.pumpTime
    }

  } catch (e) {
    res.send(e);

  } finally {
    var time = new Date();
    time.setDate(time.getDate()-7)%30;
    Log.deleteMany({created: {$lt: time}}, (err) => {
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

  }
};

// ======================================== EXPORT ========================================
module.exports = callbacks;
