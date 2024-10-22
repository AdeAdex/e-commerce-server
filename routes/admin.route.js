// server/routes/admin.route.js

import { Router } from "express";
import {
  adminForgotPassword,
  adminResetPassword,
  adminVerifyPasswordResetTokenAndOTP,
  createAdmin,
  sendPromotionalEmailsToAllUsers,
} from "../controllers/admin.controller.js";
import passport from "../passport.js";
import { ensureAdminAccess } from "../middlewares/auth.middleware.js";
import { createAdminValidation } from "../validators/adminValidators.js";
import {
  getTotalSales,
  getTotalSalesOnDayBefore,
  getTotalTransactions,
  getTotalUsers,
  getTransactionsOnDayBefore,
  getUsersRegisteredOnDayBefore,
} from "../utils/libs/dbUtils.js";

const adminRouter = Router();

adminRouter.post("/admin/register", createAdminValidation, createAdmin);
adminRouter.post("/admin/login", (req, res, next) => {
  passport.authenticate("admin-local", (err, admin, info) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (!admin) {
      const errorMessage = info
        ? info.message || "Unauthorized"
        : "Unauthorized";
      return res.status(401).json({ message: errorMessage });
    }
    res.status(200).json({ message: "Admin login successful", admin: admin });
  })(req, res, next);
});

adminRouter.get(
  "/admin/dashboard",
  (req, res, next) => {
    passport.authenticate("admin-jwt", async (err, admin, info) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (!admin) {
        // console.log(info.message);

        const errorMessage = info
          ? info.message || "Unauthorized"
          : "Unauthorized";
        console.log(errorMessage);
        return res.status(401).json({ message: errorMessage });
      }

      try {
        const totalUsers = await getTotalUsers();
        console.log("Total users:", totalUsers);

        const totalTransaction = await getTotalTransactions();
        console.log("Total Transaction:", totalTransaction);

        const totalSales = await getTotalSales();
        const totalSalesAmount =
          totalSales.length > 0 ? totalSales[0].totalAmount : 0;
        console.log("Total Sales:", totalSalesAmount);

        const currentDate = new Date();
        const oneDayBefore = new Date(currentDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);

        const totalSalesOnDayBefore = await getTotalSalesOnDayBefore(
          oneDayBefore,
          currentDate
        );
        const totalSalesAmountOnDayBefore =
          totalSalesOnDayBefore.length > 0
            ? totalSalesOnDayBefore[0].totalAmount
            : 0;

        const totalUsersRegisteredOnDayBefore =
          await getUsersRegisteredOnDayBefore(oneDayBefore, currentDate);
        const totalTransactionsOnDayBefore = await getTransactionsOnDayBefore(
          oneDayBefore,
          currentDate
        );

        req.session.isAdmin = admin.isAdmin;
        admin.password = undefined;
        admin.resetPasswordToken = undefined;
        admin.editEmailToken = undefined;

        req.admin = admin;
        req.totalUsers = totalUsers;
        req.totalTransaction = totalTransaction;
        req.totalSalesAmount = totalSalesAmount;
        req.totalSalesAmountOnDayBefore = totalSalesAmountOnDayBefore;
        req.totalUsersRegisteredOnDayBefore = totalUsersRegisteredOnDayBefore; // Store usersRegisteredOnDayBefore in the request object
        req.totalTransactionsOnDayBefore = totalTransactionsOnDayBefore; // Store totalTransactionsOnDayBefore in the request object

        next();
      } catch (error) {
        console.error("Error fetching total users:", error.message);
        return res.status(500).json({ message: "Error fetching total users" });
      }
    })(req, res, next);
  },
  ensureAdminAccess,
  (req, res) => {
    res.status(200).json({
      message: "Admin dashboard accessed successfully",
      admin: req.admin,
      totalUsers: req.totalUsers,
      totalTransaction: req.totalTransaction,
      totalSalesAmount: req.totalSalesAmount,
      totalSalesAmountOnDayBefore: req.totalSalesAmountOnDayBefore,
      totalUsersRegisteredOnDayBefore: req.totalUsersRegisteredOnDayBefore,
      totalTransactionsOnDayBefore: req.totalTransactionsOnDayBefore,
    });
  }
);

adminRouter.post("/admin/logout", (_req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logout successful" });
});

adminRouter.post("/admin/forgot-password", adminForgotPassword);
adminRouter.post(
  "/admin/reset_password/verification",
  adminVerifyPasswordResetTokenAndOTP
);
adminRouter.post("/admin/reset_password", adminResetPassword);
adminRouter.post("/send-promotional-email", sendPromotionalEmailsToAllUsers);

export default adminRouter;
