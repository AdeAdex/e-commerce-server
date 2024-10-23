// server/passport.js

import passport from "passport";
import UserModel from "./models/user.model.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import AdminModel from "./models/admin.model.js";
import { comparePasswords } from "./utils/libs/bcryptUtils.js";
import { generateUsersAuthToken } from "./utils/libs/userJwtUtils.js";
import { generateAdminAuthToken } from "./utils/libs/adminJwtUtils.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_SECRET;
const usersSecretKey = process.env.JWT_SECRET_USER;
const adminSecretKey = process.env.JWT_SECRET_ADMIN;

// Strategy for user authentication with google

const callbackURL =
  process.env.NODE_ENV === 'production'
    ? 'https://adex-e-commerce-server.vercel.app/api/google/callback'
    : 'http://localhost:5000/api/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
    },
    async function (accessToken, refreshToken, profile, done) {
      // console.log("Google ID", profile.id);
      try {
        const existingUser = await UserModel.findOne({
          email: profile.emails[0].value,
        }).select("-password -resetPasswordToken -editEmailToken");

        if (!existingUser) {
          // Create a new user
          const newUser = new UserModel({
            fullname: profile.displayName,
            email: profile.emails[0].value,
            photo: profile.photos[0].value,
            googleId: profile.id,
          });

          await newUser.save();
          console.log("Created a new user");
          return done(null, newUser);
        } else {
          console.log("Existing user found");
          const token = generateUsersAuthToken({
            email: profile.emails[0].value,
          });
          // console.log("Google Auth Token", token);
          return done(null, { user: existingUser, token: token });
        }
      } catch (error) {
        console.error("Error during user creation:", error);
        done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Local Strategy for admin authentication

passport.use(
  "admin-local",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      rememberMeField: "condition",
      passReqToCallback: true,
    },
    async (req, identifier, password, done) => {
      try {
        const { rememberMe } = req.body;
        const admin = await AdminModel.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });

        if (!admin) {
          return done(null, false, {
            message: "Incorrect username or password",
          });
        }

        const passwordMatch = await comparePasswords(password, admin.password);

        if (!passwordMatch) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        let token;
        if (rememberMe) {
          console.log("true remember ", rememberMe);

          // Generate a long-lived token (e.g., valid for 30 days)
          token = generateAdminAuthToken({ email: admin.email }, true);
          console.log(token);

          req.res.cookie("adminRememberMeToken", token, {
            maxAge: 1 * 60 * 1000,
            httpOnly: true,
          });
        } else {
          console.log("false remember ", rememberMe);

          // Set the token in a cookie with a standard expiration of 1 day
          token = generateAdminAuthToken({ email: admin.email });
          req.res.cookie("adminRememberMeToken", token, {
            maxAge: 20 * 1000,
            httpOnly: true,
          });
        }

        // Remove sensitive information from user object
        admin.password = undefined;
        admin.resetPasswordToken = undefined;
        admin.editEmailToken = undefined;

        return done(null, { admin, token });
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Local Strategy for user authentication
passport.use(
  "user-local",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      rememberMeField: "condition",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const { rememberMe } = req.body;
        const user = await UserModel.findOne({
          $or: [{ email: email }, { phoneNumber: email }],
        });

        if (!user) {
          console.log("user not found");
          return done(null, false, { message: "Incorrect email or password" });
        }

        // If the user signed in with Google, generate a token
        if (user.googleId && !user.password) {
          // Check if the user with the provided googleId exists
          const googleUser = await UserModel.findOne({
            googleId: user.googleId,
          });

          // If there's no user with the provided googleId, return an error
          if (!googleUser) {
            console.log("User google ID doesn't match");
            return done(null, false, { message: "Incorrect google ID" });
          }

          console.log("User signed in using the google ID");
          const token = generateUsersAuthToken({ email: user.email });
          req.res.cookie("rememberMeToken", token, {
            maxAge: 20 * 1000,
            httpOnly: true,
          });
          return done(null, { user, token });
        } else {
          const passwordMatch = await comparePasswords(password, user.password);

          if (!passwordMatch) {
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }

          console.log("User signed in using the Form");

          let token;
          if (rememberMe) {
            console.log("remember me is", rememberMe);

            // Generate a long-lived token (e.g., valid for 30 days)
            token = generateUsersAuthToken({ email: user.email }, true);
            req.res.cookie("rememberMeToken", token, {
              maxAge: 1 * 60 * 1000,
              httpOnly: true,
            });
            console.log(token);
          } else {
            console.log("remember me is ", rememberMe);

            // Set the token in a cookie with a standard expiration of 1 day
            token = generateUsersAuthToken({ email: user.email });
            req.res.cookie("rememberMeToken", token, {
              maxAge: 20 * 1000,
              httpOnly: true,
            });
          }

          // Remove sensitive information from user object
          user.password = undefined;
          user.resetPasswordToken = undefined;
          user.editEmailToken = undefined;

          return done(null, { user, token });
        }
      } catch (error) {
        console.log("Error", error.message);
        return done(error);
      }
    }
  )
);

// Serialization and deserialization methods for both user and admin
passport.serializeUser((user, done) => {
  if (user instanceof UserModel) {
    done(null, { type: "user", id: user.id });
  } else if (user instanceof AdminModel) {
    done(null, { type: "admin", id: user.id });
  } else {
    done(new Error("Unsupported user type"));
  }
});

passport.deserializeUser(async ({ type, id }, done) => {
  try {
    if (type === "user") {
      const user = await UserModel.findById(id);
      done(null, user);
    } else if (type === "admin") {
      const admin = await AdminModel.findById(id);
      done(null, admin);
    } else {
      done(new Error("Unsupported user type"));
    }
  } catch (error) {
    done(error);
  }
});

// passport.serializeUser((user, admin, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await UserModel.findById(id);
//     if (user) {
//       done(null, user);
//     } else {
//       const admin = await AdminModel.findById(id);
//       done(null, admin);
//     }
//   } catch (error) {
//     done(error);
//   }
// });

const userJWTOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: usersSecretKey,
};

// JWT strategy for user authentication
passport.use(
  "user-jwt",
  new JwtStrategy(userJWTOptions, async (payload, done) => {
    try {
      const user = await UserModel.findOne({ email: payload.email });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

// JWT strategy for admin authentication

const adminJWTOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: adminSecretKey,
};

passport.use(
  "admin-jwt",
  new JwtStrategy(adminJWTOptions, async (payload, done) => {
    try {
      const admin = await AdminModel.findOne({ email: payload.email });
      if (admin) {
        return done(null, admin);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
