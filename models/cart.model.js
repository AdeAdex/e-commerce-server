// server/models/cart.model.js

import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true }
});

const CartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [CartItemSchema],
}, { timestamps: true });

const CartModel = mongoose.model("Cart", CartSchema);

export default CartModel;
