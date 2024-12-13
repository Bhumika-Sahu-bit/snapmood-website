const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const userRoute = require("../models/user");
// const GoogleStrategy = require("passport-google-oauth2").Strategy;
require("dotenv").config();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find the user by username
      const user = await userRoute.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      // Verify password with bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }

      // If passwords match, return the user
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/callback",
//       passReqToCallback: true,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await userRoute.findOne({ googleId: profile.id });
//         if (!user) {
//           user = await userRoute.create({
//             googleId: profile.id,
//             username: profile.displayName,
//             email: profile.emails[0].value,
//           });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRoute.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
