/*=================================INIT - BEGIN===============================*/
const express         = require("express"),
      app             = express(),
      bodyParser      = require("body-parser"),
      mongoose        = require("mongoose"),
      methodOverride  = require("method-override"),
      fs              = require("file-system"),
      path            = require("path"),
      requestIp       = require('request-ip'),
      dotenv          = require("dotenv").config(); // Configure .env variables

/* Configure Database */
mongoose.connect(process.env.DATABASEURL, { useNewUrlParser:  true,
                                            useCreateIndex:   true,
                                            useFindAndModify: false,
                                            useUnifiedTopology: true }, () => { console.log("DB Connected")}).catch((err) => console.log(err));

/* Configure Other packages */
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(requestIp.mw());

//Passport Config
var passport = require("./auth/google.js");
app.use(require("cookie-session")({
  maxAge: 12 * 60 * 60 * 1000, // 12 hrs for cookie expiration
  keys: [process.env.SESSION_SECRET]
}));
app.use(passport.initialize());
app.use(passport.session());

// Send to all views
app.use(function(req,res,next){
  res.locals.currentUser    = req.user;
  next();
});

/* Create route variables*/
const indexRoutes         = require("./routes/index"),
      controllerRoutes    = require("./routes/controller"),
      authRoutes          = require("./routes/auth"),
      configRoutes        = require("./routes/config");
      dataRoutes          = require("./routes/data");

//require routes
app.use("/", indexRoutes);
app.use("/controller",controllerRoutes);
app.use("/auth",authRoutes);
app.use("/config",configRoutes);
app.use("/data",dataRoutes);

/*=================================INIT - END=================================*/
/*=================================LISTEN - BEGIN=============================*/
app.listen(process.env.PORT, function(){
  console.log("Server Started");
});
/*=================================LISTEN - END===============================*/
