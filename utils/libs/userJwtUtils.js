// utils/userJwtUtils.js
import jwt from "jsonwebtoken";
// import crypto from "crypto";

// JWT secret keys and expiration durations
const usersSecretKey = process.env.JWT_SECRET_USER;
const resetPasswordSecretKey = process.env.JWT_RESET_PASSWORD_SECRET_USER;
const updateUserProfileEmailSecretKey = process.env.JWT_EMAIL_SECRET_USER;

const expiresInNormalTime = process.env.JWT_DURATION_NORMAL;
const expiresInLongTime = process.env.JWT_DURATION_REMEMBER_ME;

const expiredOTPIn = process.env.JWT_LASTED_FOR;




//   Users

/**
 * Function to generate a JWT token for authentication
 * Generates a JWT token with the provided payload.
 * @param {Object} payload The payload to be encoded in the JWT token.
 * @returns {string} The generated JWT token.
 */

export const generateUsersAuthToken = (payload, rememberMe = false) => {
  try {
    const expiresIn = rememberMe ? expiresInLongTime : expiresInNormalTime;
    console.log(expiresIn)

    const token = jwt.sign(payload, usersSecretKey, { expiresIn });
    return token;
  } catch (error) {
    console.error("Error generating token:", error.message);
  }
};



// /**
//  * Function to verify JWT token when user is accessing the Dashboard
//  * Verifies the validity of a JWT token.
//  * @param {string} token The JWT token to be verified.
//  * @returns {Object|null} The decoded payload if the token is valid, null otherwise.
//  */

// export const verifyAuthToken = (token) => {
//   try {
//     const decodedToken = jwt.verify(token, secretKey);
//     return decodedToken;
//   } catch (error) {
//     return null; // Token verification failed
//   }
// };

/**
 * Generates a JWT token containing an OTP for password reset.
 * @param {string} email The email associated with the OTP.
 * @returns {string} The JWT token containing the OTP.
 */

export const generatePasswordResetOTP = (email) => {
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

export const extractOTPFromForgotPasswordToken = (token) => {
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

export const verifyPasswordResetOTP = (token, otp) => {
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

export const verifyResetPasswordToken = (token) => {
  try {
    const resetDecodedToken = jwt.verify(token, resetPasswordSecretKey, {
      ignoreExpiration: true,
    });
    return resetDecodedToken;
  } catch (error) {
    return null;
  }
};

/**
 * Generates a JWT token containing an OTP for updating user profile email.
 * @param {string} email The new email associated with the OTP.
 * @returns {string} The JWT token containing the OTP.
 */

export const generateUpdateUserProfileEmailOTP = (email) => {
  try {
    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // Invalidate previous OTP by generating a new token with the new OTP
    const token = jwt.sign({ otp, email }, updateUserProfileEmailSecretKey, {
      expiresIn: expiredOTPIn,
    });

    return token;
  } catch (error) {
    console.error(
      "Error generating OTP for updating user profile email:",
      error
    );
    throw error;
  }
};

/**
 * Extracts the OTP from a JWT token used in the updateUserProfileEmail controller.
 * Decodes the OTP from a JWT token.
 * @param {string} token The JWT token containing the OTP.
 * @returns {string|null} The decoded OTP if found, null otherwise.
 */

export const extractOTPFromUpdateUserProfileEmailToken = (token) => {
  const otp = jwt.decode(token).otp;
  if (otp) {
    return otp;
  } else {
    return null;
  }
};

/**
 * Verifies an OTP against a JWT token used for updating user profile email.
 * @param {string} token The JWT token containing the OTP.
 * @param {string} otp The OTP to be verified.
 * @returns {Object|null} The decoded payload if the OTP is correct, null otherwise.
 */

export const verifyUserProfileEmailOTP = (token, otp) => {
  try {
    const decodedToken = jwt.verify(token, updateUserProfileEmailSecretKey, {
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

// Usage of functions:
// - generateAuthToken: Used for user authentication.
// - verifyAuthToken: Used for verifying authentication tokens.
// - generatePasswordResetOTP: Used for generating OTP tokens for password reset.
// - extractOTPFromForgotPasswordToken: Used for extracting OTP from tokens in the forgot password process.
// - verifyPasswordResetOTP: Used for verifying OTP tokens in the password reset process.
// - verifyResetPasswordToken: Used for verifying reset password tokens.
// - extractOTPFromUpdateUserProfileEmailToken: Used for extracting OTP from tokens in the update user profile email process.
// - generateUpdateUserProfileEmailOTP: Used for generating OTP tokens for updating user profile email.
// - verifyUserProfileEmailOTP: Used for verifying OTP tokens in the update user profile email process.




