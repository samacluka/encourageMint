var passport       = require("passport"),
    GoogleStrategy = require('passport-google-oauth20').Strategy;

var User           = require("../models/user");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ googleId: profile.id }, (err, user) => {
      if(err){
        console.log(err);
        done(err, null);
      } else if(user){
        done(null, user);
      } else {
        User.create({
          googleId: profile.id,
          email: profile._json.email,
          username: profile._json.email,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
        }, function(err, newUser){
          if (err) {
            console.log(err);
          } else {
            done(null, newUser);
          }
        });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
