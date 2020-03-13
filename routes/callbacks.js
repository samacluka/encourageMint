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

const sendmail        = require(rootDir+"emails/nodemailer.js");

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
  },
  data: {
    get: {
      // plant
      // log
      // message
      // default
    },
    post: {
      // newPlant
    },
    put: {
      // notifications
      // updatePlant
      swap:{
        // logs
      },
      duplicate:{
        // logs
      }
    },
    delete: {
      // message
    }
  },
  controller: {
    get: {
      // setpoints
      // epoch
    },
    post: {
      // message
    },
    put: {
      // logs
    }
  },
  config: {
    get: {
      // success
    },
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
  scope: ['profile','email']
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
    if(err) throw err;
    Default.find({}, (err, foundDefaults) => {
      if(err) throw err;
      res.render(views.index.index, { numPlants: foundPlants.length,
                                      defaults: foundDefaults });
    });
  });
};

// ======================================== DATA ========================================
// GET
callbacks.data.get.log = function(req,res){
  var time = new Date();
  time.setTime(time.getTime() - req.params.time * 60 * 60 * 1000);

  // Find anything younger than one week
  var query = {plant: req.params.id, created: {$gt: time}}; // Making room for the query to be built up

  Log.find(query).sort('created').exec((err, logs) => {
    if (err) throw err;
    if(logs.length > 500){
      logs = logs.filter((l, i, a) => {
        return(!(i%(10 - req.params.time/24) === 0));
      });
    }
    res.send(logs);
  });
}

callbacks.data.get.plant = function(req,res){
  var query = {};
  if(req.query.type === 'uid'){
    query = {Owner: req.query.id};
  } else if(req.query.type === 'pid') {
    query = {_id: req.query.id};
  }

  Plant.find(query, (err, foundPlants) => {
    if (err) throw err;
    res.send(foundPlants);
  });
}

callbacks.data.get.message = function(req,res){
  Message.find({plant: req.query.id}, (err, foundMessages) => {
    if(err) throw err;
    res.send(foundMessages);
  });
}

callbacks.data.get.default = function(req,res){
  Default.find({type: req.query.type}, (err, foundDefault) => {
    if(err) throw err;
    res.send(foundDefault);
  });
}

// POST
callbacks.data.post.newPlant = function(req, res){
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
    res.send(newPlant);
  });
}

// PUT
callbacks.data.put.notifications = function(req,res){
  User.findById(req.body.user, (err, foundUser) => {
    if(err) throw err;
    foundUser.notifications = req.body.checked;
    foundUser.save()
                .then((savedUser) => {
                  res.end();
                }).catch((e) => {
                  console.log(e);
                  res.end();
                });
  });
}

callbacks.data.put.updatePlant = function(req, res){
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

callbacks.data.put.swap.logs = function(req,res){
  Log.find({plant: req.body.from}, function(err, foundLogs){
    if(err) throw err;
    foundLogs.forEach(async function(d,i,l){
      d.plant = req.body.to;
      await d.save();
    });
    res.end();
  });
}

callbacks.data.put.duplicate.logs = function(req,res){
  Log.find({plant: req.body.from}, function(err, foundLogs){
    if(err) throw err;
    foundLogs.forEach(async function(d,i,l){
      d.plant = req.body.to;
      await Log.create(d);
    });
    res.end();
  });
}

// DELETE
callbacks.data.delete.message = function(req,res){
  Message.deleteOne({_id: req.body.id}, (err) => {
    if(err) throw err;
    res.end();
  });
}

callbacks.data.delete.plant = function(req, res){
  Plant.deleteOne({_id: req.body.id}, function(err){
    if(err) throw err;
    Log.deleteMany({plant: req.body.id}, function(err){
      if(err) throw err;
      Message.deleteMany({plant: req.body.id}, function(err){
        if(err) throw err;
        res.end();
      });
    });
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

callbacks.controller.get.epoch = function(req,res){
  res.send(JSON.stringify({epoch: Math.floor(new Date().getTime() / 1000)}));
}

// POST
callbacks.controller.post.message = function(req,res){
  try {
    var mesObj = {
      plant: req.body.plantid,
      message: req.body.message,
      type: req.body.type
    }
    Plant.findOne({_id: req.body.plantid}, (err, foundPlant) => {
      User.findOne({_id: foundPlant.Owner}, (err, foundUser) => {
        if(foundUser.notifications){
          sendmail(foundPlant.Name, req.body.message, foundUser.email);
        }
      });
    });

    var time = new Date();
    time.setTime(time.getTime()- 7 * 24 * 60 * 60 * 1000); // One week ago
    Message.deleteMany({created: {$lt: time}}); //Delete any messages older than a week

    Message.create(mesObj, (err, newMessage) => {
      if(err) throw err;
      res.end();
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
    time.setTime(time.getTime()- 7 * 24 * 60 * 60 * 1000); // One week ago
    Log.deleteMany({created: {$lt: time}}); //Delete any logs older than a week

    Log.create(logObj,(err, newLog) => {
      if(err) throw err;
      res.end();
    });

  } catch (e) {
    res.send(e);
  }
};

// ======================================== CONFIGURATION ========================================
// GET
callbacks.config.get.success = function(req,res){
  if(req.body.mc){
    var query = { mc: req.body.mc };
  } else if(req.query.plant){
    var query = { plant: req.query.plant };
  }

  Config.find(query, function(err, foundConfig){
    res.send(JSON.stringify(foundConfig));
  });
}

// POST
callbacks.config.post.new = function(req,res){
  var time = new Date();
  time.setTime(time.getTime() - 5 * 60 * 1000); // 5 minutes ago

  reqIp = req.clientIp.split('.')[0] + req.clientIp.split('.')[1]; // concat first two elements of ip

  // Find anything newer than 5 minutes
  var query = {created: {$gt: time}, ip: reqIp};

  Config.findOne(query, (err, foundConfig) => {
    if(err) throw err;
    if(foundConfig && foundConfig.success) return res.end() // stop if config is already successfully associated

    if(!req.body.plant){ // From Microcontroller
      var mcid = genUID();
      var mcidJSON = JSON.stringify({id: mcid});
      if(foundConfig){ // Second to hit route
        console.log("Microcontroller was second to route");
        foundConfig.success = true;
        foundConfig.mc = mcid;
        foundConfig.save();

          Plant.findById(foundConfig.plant, (err, foundPlant) => {
            if(err) throw err;
            foundPlant.mc = mcid;
            foundPlant.save();
          });

        console.log('Microcontroller finished config');
        return res.send(mcidJSON);
      } else { // First to hit route
        console.log("Microcontroller was first to route");
        Config.create({ mc: mcid, ip: reqIp }, (err, newConfig) => { if(err) throw err; });
        console.log('Microcontroller started config');
        return res.send(mcidJSON);
      }
    } else{ // From webapp
      if(foundPlant.mc && foundPlant.mc !== "") return res.end(); // if the plant already has a mcid stop
      if(foundConfig){ // Second to hit route
        console.log("Web app was second to route");
        foundConfig.success = true;
        foundConfig.plant = req.body.plant;
        foundConfig.save();

        Plant.findById(req.body.plant, (err, foundPlant) => {
          if(err) throw err;
          foundPlant.mc = foundConfig.mc;
          foundPlant.save();
        });

        console.log('Web App finished config');
        return res.end();
      } else { // First
        console.log("Web app was first to route");
        Config.create({ plant: req.body.plant, ip: reqIp }, (err, newConfig) => { if(err) throw err; });
        console.log('Web app started config');
        return res.end();
      }
    }
  });
}

// ======================================== EXPORT ========================================
module.exports = callbacks;
