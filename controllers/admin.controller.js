// server/controllers/admin.controller.js

import { StatusCodes } from "http-status-codes";
import AdminModel from "../models/admin.model.js";
import { errorResponse, successResponse } from "../utils/libs/response.lib.js";
import tryCatchLib from "../utils/libs/tryCatch.lib.js";
import { hashPassword } from "../utils/libs/bcryptUtils.js";
import {
  sendAdminPasswordChangeConfirmationEmail,
  sendAdminPasswordResetOTP,
  sendAdminWelcomeEmail,
  sendPromotionalEmail,
} from "../utils/libs/adminEmailUtils.js";
import UserModel from "../models/user.model.js";
import EmailModel from "../models/email.model.js";
import {
  extractAdminOTPFromForgotPasswordToken,
  generateAdminPasswordResetOTP,
  verifyAdminPasswordResetOTP,
  verifyAdminResetPasswordToken,
} from "../utils/libs/adminJwtUtils.js";
/**
 * Controller function to create a new admin.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */
export const createAdmin = tryCatchLib(async (req, res) => {
  // Extract data from request body
  const { username, password, fullname, email } = req.body;


  try {
    // Check if an admin with the provided email already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      console.log("Email already exists");
      // Return error response if email already exists
      return errorResponse(
        res,
        "Email already exists",
        StatusCodes.BAD_REQUEST
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new admin account if the email does not exist
    const newAdmin = await AdminModel.create({
      username,
      password: hashedPassword,
      email,
      fullname,
    });
    console.log("Admin created successfully");

    const adminFullName = newAdmin.fullname
    const firstName = adminFullName.split(" ")[0];
    const adminEmail = newAdmin.email


    await sendAdminWelcomeEmail(adminEmail, firstName);
    console.log("Welcome email sent successfully.");

    // Respond with success message and newly created admin data
    return successResponse(
      res,
      "Admin created successfully",
      // newAdmin,
      StatusCodes.CREATED
    );
  } catch (error) {
    console.log(error.message);
    // Handle errors and respond with an appropriate error message
    return errorResponse(
      res,
      "Failed to create admin",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Controller function to handle forgot password requests by admin.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const adminForgotPassword = tryCatchLib(async (req, res) => {
  const { email } = req.body;

  try {
    const existingAdmin = await AdminModel.findOne({ email });

    if (!existingAdmin) {
      console.log("Email doesn't exist with us");
      return errorResponse(
        res,
        "Email doesn't exist with us",
        StatusCodes.NOT_FOUND
      );
    }

    const adminEmail = existingAdmin.email;
    const adminFullName = existingAdmin.fullname;
    const firstName = adminFullName.split(" ")[0];

    console.log(existingAdmin);

    // Generate token only using payload
    const token = generateAdminPasswordResetOTP(adminEmail);
    const otp = extractAdminOTPFromForgotPasswordToken(token);

    // Update the admin document with the latest OTP token
    existingAdmin.resetPasswordToken = token;
    await existingAdmin.save();

    // Send OTP to admin's email
    await sendAdminPasswordResetOTP(adminEmail, otp, firstName);

    return successResponse(
      res,
      "Accessed",
      { token, adminEmail },
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

export const adminVerifyPasswordResetTokenAndOTP = tryCatchLib(
  async (req, res) => {
    const { otp, token } = req.body;

    if (!token || !otp) {
      return errorResponse(
        res,
        "Token or OTP is missing",
        StatusCodes.BAD_REQUEST
      );
    }

    try {
      const existingAdmin = await AdminModel.findOne({
        resetPasswordToken: token,
      });

      if (!existingAdmin) {
        return errorResponse(res, "Invalid token", StatusCodes.UNAUTHORIZED);
      }

      // Verify OTP against the token stored in the user document
      const decodedToken = verifyAdminPasswordResetOTP(token, otp);

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
  }
);

/**
 * Controller function to reset user password.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const adminResetPassword = tryCatchLib(async (req, res) => {
  const { email, password, token } = req.body;

  try {
    const existingAdmin = await AdminModel.findOne({
      resetPasswordToken: token,
    });

    if (!existingAdmin) {
      return errorResponse(res, "Invalid token", StatusCodes.UNAUTHORIZED);
    }

    const decodedToken = verifyAdminResetPasswordToken(token);
    if (!decodedToken) {
      console.log("Invalid Token");
      return errorResponse(res, "Invalid Token", StatusCodes.UNAUTHORIZED);
    }

    if (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000)) {
      console.log("Token has expired");
      return errorResponse(res, "Token has expired", StatusCodes.UNAUTHORIZED);
    }

    if (existingAdmin.email != email) {
      return errorResponse(res, "Admin not found", StatusCodes.NOT_FOUND);
    } else {
      const hashedPassword = await hashPassword(password);

      // Update the user's password
      existingAdmin.password = hashedPassword;

      const fullname = existingAdmin.fullname;
    const firstName = fullname.split(" ")[0];


      // Save the updated existingAdmin object to the database
      await existingAdmin.save();
      await sendAdminPasswordChangeConfirmationEmail(email, firstName);

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
 * Controller function to send promotional emails to all registered users.
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */
export const sendPromotionalEmailsToAllUsers = tryCatchLib(async (req, res) => {
  const { subject, text } = req.body;
  const adminId = "65ff0379aad9d6d781fc0a75";
  try {
    // Save email subject and text into the database
    await EmailModel.create({ subject, texts: [{ text, admin: adminId }] });

    // Retrieve only registered users who have notifications set to true
    const registeredUsers = await UserModel.find(
      { "preferences.notifications": true },
      { email: 1, fullname: 1 }
    );

    // Extract email addresses and names from the retrieved user data
    for (const user of registeredUsers) {
      const { email, fullname } = user;
      const firstName = fullname.split(" ")[0];
      console.log(email, fullname);
      console.log(firstName);
      await sendPromotionalEmail(email, firstName, subject, text);
      console.log(
        `Promotional email sent successfully to ${firstName} with the email: ${email}.`
      );
    }

    return successResponse(
      res,
      "Promotional emails sent successfully to all registered users",
      StatusCodes.OK
    );
  } catch (error) {
    console.error(
      "Error sending promotional emails to all registered users:",
      error
    );
    return errorResponse(
      res,
      "Failed to send promotional emails to all registered users",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});
