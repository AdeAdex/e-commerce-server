// server/routes/order.route.js

import { Router } from "express";
import {
  getAllOrdersByAdmin,
  getTotalSales,
  getUserOrders,
  updateOrderStatusByAdmin,
} from "../controllers/order.controller.js";
import {
  ensureAdminAccess,
  ensureUser,
} from "../middlewares/auth.middleware.js";

const orderRouter = Router();

orderRouter.get("/orders/my-orders/:userId", /*  ensureUser, */ getUserOrders);
orderRouter.get("/orders/all", /* ensureAdminAccess, */ getAllOrdersByAdmin);
orderRouter.put(
  "/orders/:orderId/update",
  /* ensureAdminAccess, */ updateOrderStatusByAdmin
);

export default orderRouter;

orderRouter.get("/orders/sales/total", /* ensureAdminAccess, */ getTotalSales);

