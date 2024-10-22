// server/routes/index.js

import { Router } from "express";
import userRouter from "./user.route.js";
import authRoute from "./auth.js"
import productRouter from "./product.route.js";
import adminRouter from "./admin.route.js";
import cartRouter from "./cart.route.js";
import orderRouter from "./order.route.js";


const route = Router();

route.use(userRouter);
route.use(authRoute);
route.use(productRouter);
route.use(adminRouter);
route.use(cartRouter)
route.use(orderRouter)

export default route;