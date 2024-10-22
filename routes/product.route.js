// server/routes/product.route.js

import { Router } from "express";
import {
  createProduct,
  deleteProductByAdmin,
  getAllProducts,
  getProductByID,
  processPayment,
  updateProductByAdmin,
  verifyPaymentTransaction,
} from "../controllers/product.controller.js";
import { ensureAdminAccess, ensureUser } from "../middlewares/auth.middleware.js";


const productRouter = Router();


productRouter.post("/products/create", ensureAdminAccess, createProduct);
productRouter.get("/products/all", getAllProducts); 
productRouter.get("/products/:id", getProductByID);
productRouter.put("/products/update/:id", ensureAdminAccess, updateProductByAdmin);
productRouter.delete("/products/delete/:id", ensureAdminAccess, deleteProductByAdmin);
productRouter.post("/products/create-checkout-session", /* ensureUser, */ processPayment);
productRouter.post("/products/verify-transaction", verifyPaymentTransaction);


export default productRouter;
