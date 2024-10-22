// server/middlewares/auth.middleware.js

import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../utils/libs/response.lib.js";

export const ensureAdminAccess = (req, res, next) => {
  // console.log("middleware Admin",req.admin)
  
  if ((req.admin && req.admin.isAdmin) || req.session.isAdmin) {
    next();
  } else {
    console.log("Unauthorized. Access Denied. You are not an Admin");
    return errorResponse(
      res,
      "Unauthorized. Access Denied. You are not an Admin",
      StatusCodes.UNAUTHORIZED
    );
  }
};


export const ensureUser = (req, res, next) => {
  if (req.user) {
    // console.log("passport user id", req.user)
    next(); // User is authenticated, proceed to the next middleware
  } else {
    console.log("Unauthorized. Access Denied, You haven't Login");
    return errorResponse(
      res,
      "Unauthorized. Access Denied, You haven't Login",
      StatusCodes.UNAUTHORIZED
    );
  }
};