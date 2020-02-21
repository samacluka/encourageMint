const rootDir = "../";

const passport        = require("passport");

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
  res.render(views.index.landing);
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
    if(err || !logs){
      console.log(err | "No Logs");
      res.send(err | "No Logs");
    } else {
      res.send(logs);
    }
  });
}

callbacks.index.get.newPlant = function(req, res){
  res.render(views.index.newPlant);
}

callbacks.index.get.updatePlant = function(req, res){
  res.render(view.index.updatePlant);
}

callbacks.index.post.newPlant = function(req, res){
  var PlantObj = {
      Name: req.body.name,
      Type: req.body.type,
      Owner: req.user,
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
          if(err){
            console.log(err);
            res.send(err);
          } else {
            res.render(views.index.index);
          }
        });
}

callbacks.index.put.updatePlant = function(req, res){
  Plant.findById(req.body.plantid, (err, foundPlant) => {
    foundPlant.Name = req.body.name;
    foundPlant.Type = req.body.type;
    foundPlant.Owner = req.user;
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
    time.setDate(time.getDate()-7)%30; // One week ago
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

callbacks.config.post.new = function(req,res){
  var time = new Date();
  time.setTime(time.getTime()-300000);

  // Find anything newer than 5 minutes
  var query = {created: {$gt: time}, ssid: req.body.ssid};

  Config.findOne(query, (err, foundConfig) => {
    if(err){
      console.log(err);
      return res.send(err);
    }

    if(req.body.mc){ // From Microcontroller
      if(foundConfig){ // Second to hit route
        console.log("Microcontroller was second to route");
        Plant.findById(foundConfig.plant, (err, foundPlant) => {
          if(err){
            console.log(err);
            res.send(err);
          }

          foundPlant.mc = req.body.mc;
          foundPlant.save().then((savedPlant) => {
            Config.deleteOne({ssid: req.body.ssid}, (err) => {
              if(err){
                console.log(err);
                return res.send(err);
              } else {
                return res.send(genUID());
              }
            });
          });
        });
      } else { // First to hit route
        console.log("Microcontroller was first to route");
        Config.create({
          mc: req.body.mc,
          ssid: req.body.ssid
        },(err, newConfig) => {
          if(err){
            console.log(err);
            return res.send(err);
          }
          return res.send(genUID());
        });
      }
    } else{ // From webapp
      if(foundConfig){ // Second to hit route
        console.log("Web app was second to route");
        Plant.findById(req.body.plant, (err, foundPlant) => {
          if(err){
            console.log(err);
            res.send(err);
          }

          foundPlant.mc = foundConfig.mc;
          foundPlant.save().then((savedPlant) => {
            Config.deleteOne({ssid: req.body.ssid}, (err) => {
              if(err){
                console.log(err);
                res.send(err);
              }
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
          if(err){
            console.log(err);
            return res.send(err);
          }
          return res.redirect("back");
        });
      }
    }
  });
}

// ======================================== EXPORT ========================================
module.exports = callbacks;
