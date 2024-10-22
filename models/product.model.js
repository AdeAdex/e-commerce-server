// server/models/product.model.js

import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    newPrice: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
    discount: { type: Number },
    categories: { type: Array, required: true },
    sections: { type: String, required: true },
    brand: { type: String },
    quantity: { type: Number, default: 0 },
    images: [{ type: String }],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    salesCount: { type: Number, default: 0 },
    DeliveryOption: { type: String },
    shipping: {
      weight: { type: Number },
      dimensions: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
      },
      shippingCost: { type: Number },
    },
    inventory: {
      sku: { type: String },
      stockQuantity: { type: Number, default: 0 },
      minimumStockQuantity: { type: Number },
      backordered: { type: Boolean, default: false },
    },
    variants: [
      {
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
      },
    ],
    metadata: {
      tags: [{ type: String }],
      metaDescription: { type: String },
      keywords: [{ type: String }],
    },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    promotions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }],
    status: { type: String, enum: ['active', 'inactive', 'discontinued'], default: 'active' },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;
