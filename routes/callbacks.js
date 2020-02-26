const rootDir = "../";

const passport        = require("passport");

const mongoose        = require('mongoose');

const User            = require(rootDir+"models/user.js"),
      Plant           = require(rootDir+"models/plant.js"),
      Log             = require(rootDir+"models/log.js"),
      Config          = require(rootDir+"models/config.js");

const views           = require(rootDir+"views/views.js");

const genUID          = require(rootDir+"helpers/UID.js");

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
        data: {

        }
      },
      post: {
        // register
      },
      put: {

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
  config: {
    post:{
      // new
    }
  }
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
  res.redirect("/index");
};

// ======================================== INDEX ========================================
// GET
callbacks.index.get.landing = function(req,res){
  if(req.isAuthenticated()){
    res.redirect('/index');
  } else {
    res.render(views.index.landing);
  }
};

callbacks.index.get.index = function(req,res){
  Plant.find({Owner: req.user._id}, (err, foundPlants) => {
    if (err) throw err;
    res.render(views.index.index, {plants: foundPlants});
  });
};

callbacks.index.get.data.log = function(req,res){
  var time = new Date();
  time.setTime(time.getTime() - req.params.time * 60 * 60 * 1000);

  // Find anything younger than one week
  var query = {plant: req.params.id, created: {$gt: time}}; // Making room for the query to be built up

  Log.find(query).sort('created').exec((err, logs) => {
    if (err) throw err;
    res.send(logs);
  });
}

callbacks.index.get.data.plant = function(req,res){
  if(req.params.type === 'uid'){
    var query = {Owner: req.params.id};
  } else if(req.params.type === 'pid') {
    var query = {_id: req.params.id};
  }

  Plant.find(query, (err, foundPlants) => {
    if (err) throw err;
    res.send(foundPlants);
  });
}

// POST
callbacks.index.post.newPlant = function(req, res){
  var PlantObj = {
      Name: req.body.name,
      Type: req.body.type,
      Owner: req.user._id,
      soilMoisture: {
        min: req.body.soilMoistureMin,
        max: req.body.soilMoistureMax
      },
      lightThreshold: {
        min: req.body.lightThresholdMin,
        max: req.body.lightThresholdMax
      }
    };

  Plant.create(PlantObj, (err, newPlant) => {
          if(err) throw err;
          res.render(views.index.index);
        });
}

// PUT
callbacks.index.put.updatePlant = function(req, res){
  Plant.findById(req.body.plantid, (err, foundPlant) => {
    foundPlant.Name = req.body.name;
    foundPlant.Type = req.body.type;
    foundPlant.Owner = req.user._id;
    foundPlant.soilMoisture.min = req.body.soilMoistureMin;
    foundPlant.soilMoisture.max = req.body.soilMoistureMax;
    foundPlant.lightThreshold.min = req.body.lightThresholdMin;
    foundPlant.lightThreshold.max = req.body.lightThresholdMax;

    foundPlant.save().then((savedPlant) => {
      console.log(savedPlant);
      res.render(views.index.index);
    }).catch((e) => {console.log(e);});
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
      res.send("err: "+err);
    } else {
      console.log("Name: " + foundPlant.Name);
      console.log("Type: " + foundPlant.Type);
      console.log("Soil Moisture Min Threshold: " + foundPlant.soilMoisture.min);
      console.log("Soil Moisture Max Threshold: " + foundPlant.soilMoisture.max);
      console.log("Light Max Threshold: " + foundPlant.lightThreshold.min);
      console.log("Light Min Threshold: " + foundPlant.lightThreshold.max);

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

    var time = new Date();
    time.setTime(time.getTime()- 2 * 7 * 24 * 60 * 60 * 1000); // Two week ago
    //Delete any logs older than a week
    Log.deleteMany({created: {$lt: time}}, (err) => {
      if(err){
        console.log(err);
        res.send(err);
      } else {
        Log.create(logObj,(err, newLog) => {
          if(err){
            console.log(err);
            res.send(err);
          } else {
            res.send("successfully logged");
          }
        });
      }
    });

  } catch (e) {
    res.send(e);

  }
};

// ======================================== CONFIGURATION ========================================

// POST
callbacks.config.post.new = function(req,res){
  var time = new Date();
  time.setTime(time.getTime() - 60 * 5 * 1000);

  // Find anything newer than 5 minutes
  var query = {created: {$gt: time}, ssid: req.body.ssid};

  Config.findOne(query, (err, foundConfig) => {
    if(err) throw err;

    if(req.body.mc){ // From Microcontroller
      var mcid = genUID();
      if(foundConfig){ // Second to hit route
        console.log("Microcontroller was second to route");
        Plant.findById(foundConfig.plant, (err, foundPlant) => {
          if(err) throw err;

          foundPlant.mc = mcid;
          foundPlant.save().then((savedPlant) => {
            Config.deleteOne({ssid: req.body.ssid}, (err) => {
              if(err) throw err;
              return res.send(mcid);
            });
          });
        });
      } else { // First to hit route
        console.log("Microcontroller was first to route");
        Config.create({
          mc: mcid,
          ssid: req.body.ssid
        },(err, newConfig) => {
          if(err) throw err;
          return res.send(mcid);
        });
      }
    } else{ // From webapp
      if(foundConfig){ // Second to hit route
        console.log("Web app was second to route");
        Plant.findById(req.body.plant, (err, foundPlant) => {
          if(err) throw err;

          foundPlant.mc = foundConfig.mc;
          foundPlant.save().then((savedPlant) => {
            Config.deleteOne({ssid: req.body.ssid}, (err) => {
              if(err) throw err;
              return res.redirect("back");
            });
          });
        });
      } else { // First
        console.log("Web app was first to route");
        Config.create({
          plant: req.body.plant,
          ssid: req.body.ssid
        }, (err,newConfig) => {
          if(err) throw err;
          return res.redirect("back");
        });
      }
    }
  });
}

// ======================================== EXPORT ========================================
module.exports = callbacks;
