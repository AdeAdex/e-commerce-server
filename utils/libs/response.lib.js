// server/utils/libs/response.lib.js

import { StatusCodes, getReasonPhrase } from "http-status-codes";

/**
 * @description HTTP Success Response
 * @param res The Response Object
 * @param message The Success message
 * @param payload The payload
 * @returns {object}  Success Response
 */

export const successResponse = (res, message, payload, statusCode = StatusCodes.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    payload: { ...payload },
  });
};

/**
 * @description HTTP Error Response
 * @param res The Response Object
 * @param message The Error message
 * @param statusCode The HTTP Status Code
 * @returns {object}  Error Response
 * @example errorResponse(res, "User not found", 404);
 */

export const errorResponse = (res, message, statusCode) => {
  const reason = getReasonPhrase(statusCode);
  return res.status(statusCode).json({
    success: false,
    error: {
      type: reason,
      code: statusCode,
      message,
    },
  });
};
