// server/models/order.model.js
import mongoose from "mongoose";

// Define schema for orders
const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Assuming you have a Product model
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'processing', 'delivered', 'cancelled'], // Assuming these are the possible statuses
    default: 'pending'
  }
}, { timestamps: true });

// Create Order model
const OrderModel = mongoose.model('Order', OrderSchema);

export default OrderModel;
