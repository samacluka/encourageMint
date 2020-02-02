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
callbacks.index.get.home = function(req,res){
  res.render(views.index.home);
};

callbacks.index.get.index = function(req,res){
  res.render(views.index.index);
};

callbacks.index.get.index_data = function(req,res){
  var time = new Date();
  time.setDate(time.getDate()-7)%30;

  // Find anything younger than one week
  var query = {created: {$gt: time}}; // Making room for the query to be built up

  Log.find(query).limit(10).exec((err, logs) => {
    if(err){
      console.log(err);
    } else {
      res.send(logs);
    }
  });
}

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
};

// PUT
callbacks.controller.put.logs = function(req,res){
  try {
    var logObj = {
      plant: req.body.plantid,
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
    time.setDate(time.getDate()-7)%30; // One week ago
    //Delete any logs older than a week
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
