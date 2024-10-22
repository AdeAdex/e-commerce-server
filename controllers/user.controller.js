// server/controllers/user.controller.js

import { StatusCodes } from "http-status-codes";
import UserModel from "../models/user.model.js";
import tryCatchLib from "../utils/libs/tryCatch.lib.js";
import { errorResponse, successResponse } from "../utils/libs/response.lib.js";

// Importing JWT-related functions
import {
  extractOTPFromForgotPasswordToken,
  extractOTPFromUpdateUserProfileEmailToken,
  generatePasswordResetOTP,
  generateUpdateUserProfileEmailOTP,
  verifyPasswordResetOTP,
  verifyResetPasswordToken,
  verifyUserProfileEmailOTP,
} from "../utils/libs/userJwtUtils.js";

// Importing email-related functions
import {
  sendEmailUpdateConfirmationEmail,
  sendEmailWithOTPToUpdateEmail,
  sendPasswordChangeConfirmationEmail,
  sendPasswordResetOTP,
  sendWelcomeEmail,
} from "../utils/libs/userEmailUtils.js";

// Importing bcrypt-related functions
import { comparePasswords, hashPassword } from "../utils/libs/bcryptUtils.js";

/**
 * Controller function to handle user registration.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const createNewUser = tryCatchLib(async (req, res) => {
  const { fullname, email, username, phoneNumber, password, notifications } =
    req.body;

  console.log(req.body);

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      console.log("Email already exists with us");
      return errorResponse(
        res,
        "Email already exists with us",
        StatusCodes.CONFLICT
      );
    }

    const hashedPassword = await hashPassword(password);
    // console.log("Hashed Password:", hashedPassword);

    const userInfo = {
      fullname,
      email,
      username,
      phoneNumber,
      password: hashedPassword,
      preferences: {
        notifications: notifications || false,
      },
    };

    const newUser = await UserModel.create(userInfo);
    console.log("user has been created successfully");

    const firstName = fullname.split(" ")[0];

    await sendWelcomeEmail(email, firstName);
    console.log("Welcome email sent successfully.");

    return successResponse(
      res,
      "Registration successful",
      // newUser,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return errorResponse(
      res,
      "Failed to create user",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

// /**
//  * Controller function to handle user authentication.
//  * @param {Object} req The request object.
//  * @param {Object} res The response object.
//  * @returns {Object} The response object.
//  */

// export const authenticateUser = tryCatchLib(async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       console.log("Email doesn't exist");
//       return errorResponse(res, "Email doesn't exist", StatusCodes.NOT_FOUND);
//     }

//     const passwordMatch = await comparePasswords(password, user.password);

//     if (!passwordMatch) {
//       console.log("Invalid email or password");
//       return errorResponse(
//         res,
//         "Invalid email or password",
//         StatusCodes.UNAUTHORIZED
//       );
//     }

//     let token = generateAuthToken({
//       email: user.email,
//     });

//     user.password = undefined;
//     user.resetPasswordToken = undefined;
//     user.editEmailToken = undefined;

//     return successResponse(
//       res,
//       "Authentication successful",
//       { user, token },
//       StatusCodes.OK
//     );
//   } catch (error) {
//     console.error("Error authenticating user:", error);
//     return errorResponse(
//       res,
//       "Failed to authenticate user",
//       StatusCodes.INTERNAL_SERVER_ERROR
//     );
//   }
// });

// /**
//  * Controller function to grant access to the dashboard.
//  * @param {Object} req The request object.
//  * @param {Object} res The response object.
//  * @returns {Object} The response object.
//  */

// export const accessDashboard = tryCatchLib(async (req, res) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     console.log("Token not provided");
//     return errorResponse(res, "Token not provided", StatusCodes.UNAUTHORIZED);
//   }

//   const decodedToken = verifyAuthToken(token);
//   if (!decodedToken) {
//     console.log("Invalid Token");
//     return errorResponse(res, "Invalid Token", StatusCodes.UNAUTHORIZED);
//   }

//   const userDataFromDatabase = {
//     userEmail: decodedToken.email,
//   };

//   if (!userDataFromDatabase) {
//     console.log("User data not found in token");
//     return errorResponse(
//       res,
//       "User data not found in token",
//       StatusCodes.UNAUTHORIZED
//     );
//   }

//   return successResponse(
//     res,
//     "Access Granted",
//     userDataFromDatabase,
//     StatusCodes.OK
//   );
// });

/**
 * Controller function to handle forgot password requests.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const forgotPassword = tryCatchLib(async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      console.log("Email doesn't exist with us");
      return errorResponse(
        res,
        "Email doesn't exist with us",
        StatusCodes.NOT_FOUND
      );
    }

    const userEmail = existingUser.email;
    const fullname = existingUser.fullname;
    const firstName = fullname.split(" ")[0];

    // Generate token only using payload
    const token = generatePasswordResetOTP(userEmail);
    const otp = extractOTPFromForgotPasswordToken(token);

    // Update the user document with the latest OTP token
    existingUser.resetPasswordToken = token;
    await existingUser.save();

    // Send OTP to user's email
    await sendPasswordResetOTP(userEmail, otp, firstName);

    return successResponse(
      res,
      "Accessed",
      { token, userEmail },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    return errorResponse(res, "Failed", StatusCodes.UNAUTHORIZED);
  }
});

/**
 * Controller function to verify password reset token and OTP.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const verifyPasswordResetTokenAndOTP = tryCatchLib(async (req, res) => {
  const { otp, token } = req.body;

  if (!token || !otp) {
    return errorResponse(
      res,
      "Token or OTP is missing",
      StatusCodes.BAD_REQUEST
    );
  }

  try {
    const existingUser = await UserModel.findOne({ resetPasswordToken: token });

    if (!existingUser) {
      return errorResponse(res, "Invalid token", StatusCodes.UNAUTHORIZED);
    }

    // Verify OTP against the token stored in the user document
    const decodedToken = verifyPasswordResetOTP(token, otp);

    if (!decodedToken) {
      return errorResponse(res, "Invalid OTP", StatusCodes.UNAUTHORIZED);
    }

    if (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000)) {
      console.log("Token has expired");
      return errorResponse(res, "Token has expired", StatusCodes.UNAUTHORIZED);
    }

    // Token is valid
    return successResponse(
      res,
      "Token verified successfully, Create a new Password",
      { decodedToken, token },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error verifying token:", error);
    return errorResponse(
      res,
      "Failed to verify token",
      StatusCodes.UNAUTHORIZED
    );
  }
});

/**
 * Controller function to reset user password.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const resetPassword = tryCatchLib(async (req, res) => {
  const { email, password, token } = req.body;

  try {
    const existingUser = await UserModel.findOne({ resetPasswordToken: token });

    if (!existingUser) {
      return errorResponse(res, "Invalid token", StatusCodes.UNAUTHORIZED);
    }

    const decodedToken = verifyResetPasswordToken(token);
    if (!decodedToken) {
      console.log("Invalid Token");
      return errorResponse(res, "Invalid Token", StatusCodes.UNAUTHORIZED);
    }

    if (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000)) {
      console.log("Token has expired");
      return errorResponse(res, "Token has expired", StatusCodes.UNAUTHORIZED);
    }

    if (existingUser.email != email) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    } else {
      const hashedPassword = await hashPassword(password);

      // Update the user's password
      existingUser.password = hashedPassword;

      const fullname = existingUser.fullname;
      const firstName = fullname.split(" ")[0];

      // Save the updated existingUser object to the database
      await existingUser.save();
      await sendPasswordChangeConfirmationEmail(email, firstName);

      return successResponse(
        res,
        "Password reset successful",
        null,
        StatusCodes.OK
      );
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return errorResponse(
      res,
      "Failed to reset password",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Controller function to update user profile name.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const updateUserProfileName = tryCatchLib(async (req, res) => {
  const { fullname, email } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      console.log(`User with email ${email} doesn't exist`);
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }

    existingUser.fullname = fullname;
    await existingUser.save();

    return successResponse(
      res,
      "Your name has been changed successfully",
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error while editing name:", error);
    return errorResponse(
      res,
      "Internal server error",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Controller function to update user profile email.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const updateUserProfileEmail = tryCatchLib(async (req, res) => {
  const { email, newEmail } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      console.log(`User with email ${email} doesn't exist`);
      return errorResponse(
        res,
        "User not found with that email",
        StatusCodes.NOT_FOUND
      );
    }

    if (existingUser.email === newEmail) {
      console.log("Email already in use");
      return errorResponse(res, "Email already in use", StatusCodes.CONFLICT);
    }

    const token = generateUpdateUserProfileEmailOTP(newEmail);
    const otp = extractOTPFromUpdateUserProfileEmailToken(token);

    // Update the user document with the latest OTP token
    existingUser.editEmailToken = token;

    await existingUser.save();
    await sendEmailWithOTPToUpdateEmail(newEmail, otp);

    return successResponse(
      res,
      "Email sent successfully",
      { newEmail, token },
      StatusCodes.OK
    );
  } catch (error) {
    console.error("Error while editing email:", error);
    return errorResponse(
      res,
      "Internal server error",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Controller function to verify user profile email update.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const updateUserProfileEmailVerification = tryCatchLib(
  async (req, res) => {
    const { otp, token, newEmail } = req.body;

    if (!token || !otp) {
      return errorResponse(
        res,
        "Token or OTP is missing",
        StatusCodes.BAD_REQUEST
      );
    }

    try {
      const existingUser = await UserModel.findOne({ editEmailToken: token });

      if (!existingUser) {
        return errorResponse(res, "Invalid token", StatusCodes.UNAUTHORIZED);
      }

      // Verify OTP against the token stored in the user document
      const decodedToken = verifyUserProfileEmailOTP(token, otp);

      if (!decodedToken) {
        return errorResponse(res, "Invalid OTP", StatusCodes.UNAUTHORIZED);
      }

      if (
        decodedToken.exp &&
        decodedToken.exp < Math.floor(Date.now() / 1000)
      ) {
        console.log("Token has expired");
        return errorResponse(
          res,
          "Token has expired",
          StatusCodes.UNAUTHORIZED
        );
      }

      // Check if the email in the payload is different from the one in the database
      if (existingUser.email !== newEmail) {
        // Update the email address only if it's different
        existingUser.email = newEmail;
        await existingUser.save();

        const fullname = existingUser.fullname;
        const firstName = fullname.split(" ")[0];

        await sendEmailUpdateConfirmationEmail(newEmail, firstName);
      } else {
        // If the email is the same, send an error response indicating it's already in use
        return errorResponse(
          res,
          "The provided email address is already in use.",
          StatusCodes.CONFLICT
        );
      }

      return successResponse(
        res,
        "The OTP has been successfully verified, and the email address has been updated.",
        decodedToken,
        StatusCodes.OK
      );
    } catch (error) {
      console.error("Error verifying token:", error);
      return errorResponse(
        res,
        "Failed to verify token",
        StatusCodes.UNAUTHORIZED
      );
    }
  }
);
