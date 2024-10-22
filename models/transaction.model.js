// server/models/transaction.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const transactionSchema = new mongoose.Schema({
  ref: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'delivered', 'cancelled'], default: 'pending' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [productSchema] // Updated to include quantity and price for each product
}, { timestamps: true });
const TransactionModel = mongoose.model('Transaction', transactionSchema);

export default TransactionModel;

