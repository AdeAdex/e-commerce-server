// utils/adminJwtUtils.js
import jwt from "jsonwebtoken";
// import crypto from "crypto";

// JWT secret keys and expiration durations
const adminSecretKey = process.env.JWT_SECRET_ADMIN;
const resetPasswordSecretKey = process.env.JWT_RESET_PASSWORD_SECRET_ADMIN;
const updateAdminProfileEmailSecretKey = process.env.JWT_EMAIL_SECRET_ADMIN;

const expiresInNormalTime = process.env.JWT_DURATION_NORMAL;
const expiresInLongTime = process.env.JWT_DURATION_REMEMBER_ME;

const expiredOTPIn = process.env.JWT_LASTED_FOR;

// Admin

export const generateAdminAuthToken = (payload, rememberMe = false) => {
  try {
    const expiresIn = rememberMe ? expiresInLongTime : expiresInNormalTime;
    console.log(expiresIn);

    const token = jwt.sign(payload, adminSecretKey, { expiresIn });
    return token;
  } catch (error) {
    console.log("Error generating token:", error.message);
  }
};

/**
 * Generates a JWT token containing an OTP for password reset.
 * @param {string} email The email associated with the OTP.
 * @returns {string} The JWT token containing the OTP.
 */
export const generateAdminPasswordResetOTP = (email) => {
  try {
    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Invalidate previous OTP by generating a new token with the new OTP
    const token = jwt.sign({ otp, email }, resetPasswordSecretKey, {
      expiresIn: expiredOTPIn,
    });

    return token;
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw error;
  }
};

/**
 * Extracts the OTP from a JWT token used in the forgotPassword controller.
 * Decodes the OTP from a JWT token.
 * @param {string} token The JWT token containing the OTP.
 * @returns {string|null} The decoded OTP if found, null otherwise.
 */
export const extractAdminOTPFromForgotPasswordToken = (token) => {
  const otp = jwt.decode(token).otp;
  if (otp) {
    return otp;
  } else {
    return null;
  }
};

/**
 * Verifies an OTP against a JWT token used for password reset.
 * @param {string} token The JWT token containing the OTP.
 * @param {string} otp The OTP to be verified.
 * @returns {Object|null} The decoded payload if the OTP is correct, null otherwise.
 */
export const verifyAdminPasswordResetOTP = (token, otp) => {
  try {
    const decodedToken = jwt.verify(token, resetPasswordSecretKey, {
      ignoreExpiration: true,
    });

    if (decodedToken && decodedToken.otp == otp) {
      return decodedToken; // Return the decoded token if OTP is correct
    } else {
      return null; // Return null if OTP is incorrect
    }
  } catch (error) {
    return null; // Return null if token verification fails
  }
};

/**
 * Verifies the validity of a reset password JWT token.
 * @param {string} token The reset password JWT token to be verified.
 * @returns {Object|null} The decoded payload if the token is valid, null otherwise.
 */
export const verifyAdminResetPasswordToken = (token) => {
  try {
    const resetDecodedToken = jwt.verify(token, resetPasswordSecretKey, {
      ignoreExpiration: true,
    });
    return resetDecodedToken;
  } catch (error) {
    return null;
  }
};
