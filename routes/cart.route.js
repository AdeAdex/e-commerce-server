// server/routes/cart.route.js

import { Router } from "express";
import {
  addItemToCart,
  getCartItems,
  reduceItemInCart,
  removeItemFromCart,
} from "../controllers/cart.controller.js";
import { ensureUser } from "../middlewares/auth.middleware.js";

const cartRouter = Router();

cartRouter.post("/cart/add-to-cart", /* ensureUser, */ addItemToCart);
cartRouter.get("/cart/get/items", /* ensureUser, */ getCartItems);
cartRouter.put("/cart/reduce/:userId/:productId", /* ensureUser, */ reduceItemInCart);
cartRouter.delete("/cart/remove/:userId/:productId",/* ensureUser, */ removeItemFromCart);

export default cartRouter;
