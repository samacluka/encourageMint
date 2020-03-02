const rootDir = "../";

const passport        = require("passport");

const mongoose        = require('mongoose');

const User            = require(rootDir+"models/user.js"),
      Plant           = require(rootDir+"models/plant.js"),
      Log             = require(rootDir+"models/log.js"),
      Config          = require(rootDir+"models/config.js"),
      Message         = require(rootDir+"models/message.js"),
      Default         = require(rootDir+'models/default.js');

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
        // landing
        // index
      },
      post: {
        // newPlant
      },
      put: {
        // updatePlant
      },
      delete: {
        // deletePlant
      }
  },
  data: {
    get: {
      // plant
      // log
      // message
    },
    delete: {
      // message
    }
  },
  controller: {
    get: {
      // setpoints
    },
    post: {
      // message
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
  console.log('================ '+req.clientIp+' ================');
  Plant.find({Owner: req.user._id}, (err, foundPlants) => {
    if (err) throw err;
    Message.find({plant: foundPlants[0]._id}, (err, foundMessages) => {
      res.render(views.index.index, {plants: foundPlants, messages: foundMessages});
    });
  });
};

// POST
callbacks.index.post.newPlant = function(req, res){
  var PlantObj = {
      Name: req.body.Name,
      Type: req.body.Type,
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
          res.end();
        });
}

// PUT
callbacks.index.put.updatePlant = function(req, res){
  Plant.findById(req.body.plantid, (err, foundPlant) => {
    foundPlant.Name = req.body.Name;
    foundPlant.Type = req.body.Type;
    foundPlant.Owner = req.user._id;
    foundPlant.soilMoisture.min = req.body.soilMoistureMin;
    foundPlant.soilMoisture.max = req.body.soilMoistureMax;
    foundPlant.lightThreshold.min = req.body.lightThresholdMin;
    foundPlant.lightThreshold.max = req.body.lightThresholdMax;

    foundPlant.save()
                .then((savedPlant) => {
                  res.end();
                }).catch((e) => {
                  console.log(e);
                  res.end();
                });
  });
}

// DELETE
callbacks.index.delete.plant = function(req, res){
  Plant.deleteOne({_id: req.body.id}, function(err){
    if(err) throw err;
    res.end();
  });
}

// ======================================== DATA ========================================
// GET
callbacks.data.get.log = function(req,res){
  var time = new Date();
  time.setTime(time.getTime() - req.params.time * 60 * 60 * 1000);

  // Find anything younger than one week
  var query = {plant: req.params.id, created: {$gt: time}}; // Making room for the query to be built up

  Log.find(query).sort('created').exec((err, logs) => {
    if (err) throw err;
    res.send(logs);
  });
}

callbacks.data.get.plant = function(req,res){
  var query = {};
  if(req.params.type === 'uid'){
    query = {Owner: req.params.id};
  } else if(req.params.type === 'pid') {
    query = {_id: req.params.id};
  }

  Plant.find(query, (err, foundPlants) => {
    if (err) throw err;
    res.send(foundPlants);
  });
}

callbacks.data.get.message = function(req,res){
  var query = {};
  if(req.params.type === 'uid'){
    query = {owner: req.params.id};
  } else if(req.params.type === 'pid') {
    query = {plant: req.params.id};
  }

  Message.find(query, (err, foundMessages) => {
    if(err) throw err;
    res.send(foundMessages);
  });
}

callbacks.data.get.default = function(req,res){
  var query = {type: req.params.type};

  Default.find(query, (err, foundDefault) => {
    if(err) throw err;
    res.send(foundDefault);
  });
}

// DELETE
callbacks.data.delete.message = function(req,res){
  var query = {_id: req.params.id};

  Message.deleteOne(query, (err) => {
    if(err) throw err;
    res.end();
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
      res.send(JSON.stringify(foundPlant));
    }
  });
};

// POST
callbacks.controller.post.message = function(req,res){
  try {
    var mesObj = {
      plant: req.body.plantid,
      message: req.body.message,
      type: req.body.type
    }

    var time = new Date();
    time.setTime(time.getTime()- 2 * 7 * 24 * 60 * 60 * 1000); // Two week ago
    //Delete any logs older than a week
    Message.deleteMany({created: {$lt: time}}, (err) => {
      if(err) throw err;
      Message.create(mesObj, (err, newMessage) => {
        if(err) throw err
        res.end();
      });
    });

  } catch (e) {
    res.send(e);
  }
}

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
      if(err) throw err;
      Log.create(logObj,(err, newLog) => {
        if(err) throw err
        res.end();
      });
    });

  } catch (e) {
    res.send(e);
  }
};

// ======================================== CONFIGURATION ========================================

// POST
callbacks.config.post.new = function(req,res){
  var time = new Date();
  time.setTime(time.getTime() - 5 * 60 * 1000);

  reqIp = req.clientIp.split('.')[0] + req.clientIp.split('.')[1]; // concat first two elements of ip

  // Find anything newer than 5 minutes
  var query = {created: {$gt: time}, ip: reqIp};

  Config.findOne(query, (err, foundConfig) => {
    if(err) throw err;

    if(!req.body.plant){ // From Microcontroller
      var mcid = JSON.stringify({id: genUID()});
      if(foundConfig){ // Second to hit route
        console.log("Microcontroller was second to route");
        Plant.findById(foundConfig.plant, (err, foundPlant) => {
          if(err) throw err;

          foundPlant.mc = mcid;
          foundPlant.save().then((savedPlant) => {
            Config.deleteOne({ip: reqIp}, (err) => {
              if(err) throw err;
              console.log('Microcontroller finished config');
              return res.send(mcid);
            });
          });
        });
      } else { // First to hit route
        console.log("Microcontroller was first to route");
        Config.create({
          mc: mcid,
          ip: reqIp
        },(err, newConfig) => {
          if(err) throw err;
          console.log('Microcontroller started config');
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
            Config.deleteOne({ip: reqIp}, (err) => {
              if(err) throw err;
              console.log('Web App finished config');
              return res.end();
            });
          });
        });
      } else { // First
        console.log("Web app was first to route");
        Config.create({
          plant: req.body.plant,
          ip: reqIp
        }, (err,newConfig) => {
          if(err) throw err;
          console.log('Web app started config');
          return res.end();
        });
      }
    }
  });
}

// ======================================== EXPORT ========================================
module.exports = callbacks;
