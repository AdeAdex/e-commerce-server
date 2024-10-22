// server/routes/user.route.js

import { Router } from "express";
import {
  createNewUser,
  forgotPassword,
  resetPassword,
  updateUserProfileEmail,
  updateUserProfileEmailVerification,
  updateUserProfileName,
  verifyPasswordResetTokenAndOTP,
} from "../controllers/user.controller.js";
import passport from "../passport.js";
import { ensureUser } from "../middlewares/auth.middleware.js";
import { createUserValidation, loginValidation } from "../validators/userValidators.js";

const userRouter = Router();

userRouter.post("/user/register", createUserValidation, createNewUser);
userRouter.post("/user/login", loginValidation, (req, res, next) => {
  passport.authenticate("user-local", (err, user, info) => {
    if (err) {
      // Handle error
      console.log(err.message)
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!user) {
      // Handle incorrect email or password
      console.log(info.message)
      return res.status(401).json({ message: info.message });
    }
    // Authentication successful, user is logged in
    req.logIn(user, (err) => {
      if (err) {
        // Handle error
        console.log(err.message)
        return res.status(500).json({ message: "Internal Server Error" });
      }
      // Respond with success message
      return res
        .status(200)
        .json({ message: "User login successful", user: req.user });
    });
  })(req, res, next);
});

userRouter.post("/user/logout", (_req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logout successful" });
});

userRouter.get("/user/dashboard", ensureUser, (req, res, next) => {
  passport.authenticate("user-jwt", (err, user, info) => {
    if (err) {
      // Log the error
      console.error(err);
      // Return an error response
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!user) {
      // Return an unauthorized response with the error message
      const errorMessage = info ? info.message || "Unauthorized" : "Unauthorized";
      return res.status(401).json({ message: errorMessage });
    }
    // User authenticated successfully, proceed with the route logic
    user.password = undefined,
    user.resetPasswordToken = undefined,
    user.editEmailToken = undefined,
    user.isAdmin = undefined
    
    res.status(200).json({ message: "Dashboard accessed successfully", user: user });
  })(req, res, next);
});
// userRouter.get("/dashboard", ensureUser);
userRouter.post("/user/forgot_password", forgotPassword);
userRouter.post("/user/reset_password/verification", verifyPasswordResetTokenAndOTP);
userRouter.post("/user/reset_password", resetPassword);
userRouter.post("/user/profile/update/name", updateUserProfileName);
userRouter.post("/user/profile/update/email", updateUserProfileEmail);
userRouter.post("/user/profile/verify/email", updateUserProfileEmailVerification);

export default userRouter;

















