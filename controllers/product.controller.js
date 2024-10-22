// server/controllers/product.controller.js

import { StatusCodes } from "http-status-codes";
import ProductModel from "../models/product.model.js";
import { errorResponse, successResponse } from "../utils/libs/response.lib.js";
import tryCatchLib from "../utils/libs/tryCatch.lib.js";
import UserModel from "../models/user.model.js";
import AdminModel from "../models/admin.model.js";
import CartModel from "../models/cart.model.js";
import TransactionModel from "../models/transaction.model.js";
import axios from "axios";
import cloudinary from "cloudinary";
import OrderModel from "../models/order.model.js"

// import stripe from "stripe";
// import https from "https";
// import Flutterwave from "flutterwave-node-v3";

// import paystack from "paystack";

// const YOUR_DOMAIN = "http://localhost:5173";
// const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
// const SECRET_KEY = "pk_test_a70c6dbb491c1021f98ea8cf0b840542607c2537";

const REDIRECT_URL = `http://localhost:5173/payment-success`;

// const flw = new Flutterwave(
//   process.env.FLW_PUBLIC_KEY,
//   process.env.FLW_SECRET_KEY
// );

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_KEY_SECRET,
});

export const createProduct = tryCatchLib(async (req, res) => {
  const { newProduct, adminId } = req.body;

  try {
    const images = newProduct.images;

    // // Upload product image to Cloudinary
    // const uploadedProductImage = await cloudinary.uploader.upload(image, {
    //   public_id: "products",
    // });

    // // Get the secure URL of the uploaded product image
    // const uploadedProductImageURL = uploadedProductImage;

    // // Add imageURL to the new product
    // newProduct.images = uploadedProductImageURL;

    // Array to store the secure URLs of uploaded images
    const uploadedImageURLs = [];

    // Upload each image to Cloudinary
    for (const image of images) {
      const uploadedImage = await cloudinary.uploader.upload(image, {
        public_id: "products",
      });

      // Add the secure URL of the uploaded image to the array
      uploadedImageURLs.push(uploadedImage.secure_url);
    }

    // Update newProduct.images with the secure URLs
    newProduct.images = uploadedImageURLs;

    const admin = await AdminModel.findById(newProduct.admin);
    if (!admin) {
      return errorResponse(res, "Admin not found", StatusCodes.NOT_FOUND);
    }

    if (!newProduct) {
      return errorResponse(
        res,
        "Failed to add product",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    // Create the product using the ProductModel
    const createdProduct = await ProductModel.create(newProduct);

    return successResponse(
      res,
      "Product added successfully",
      createdProduct,
      StatusCodes.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to add product: " + error.message,
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

export const getProductByID = tryCatchLib(async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await ProductModel.findById(productId);
    if (!product) {
      console.log("Product not found");
      return errorResponse(res, "Product not found", StatusCodes.NOT_FOUND);
    }

    return successResponse(
      res,
      "Product fetched successfully",
      product,
      StatusCodes.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch product",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

export const getAllProducts = tryCatchLib(async (req, res) => {
  try {
    const allProducts = await ProductModel.find({}); /* .populate("admin"); */
    return successResponse(
      res,
      "Products fetched successfully",
      allProducts,
      StatusCodes.OK
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch products",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

export const updateProductByAdmin = tryCatchLib(async (req, res) => {
  const productId = req.params.id;
  const updateData = req.body.newProduct;

  // console.log(updateData)

  try {
    const admin = await AdminModel.findById(updateData.admin);
    if (!admin) {
      return errorResponse(res, "Admin not found", StatusCodes.NOT_FOUND);
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return errorResponse(res, "Product not found", StatusCodes.NOT_FOUND);
    }

    console.log(updatedProduct);

    return successResponse(
      res,
      "Product updated successfully",
      updatedProduct,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error);
    return errorResponse(
      res,
      "Failed to update product",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

export const deleteProductByAdmin = tryCatchLib(async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return errorResponse(res, "Product not found", StatusCodes.NOT_FOUND);
    }

    return successResponse(
      res,
      "Product deleted successfully",
      deletedProduct,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(
      res,
      "Failed to delete product",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

//   Payment with Flutterwave

export const processPayment = async (req, res) => {
  const { cartItems, user } = req.body;
  console.log(user.id)

  try {
    // Check if user exists
    const foundUser = await UserModel.findById(user.id);
    if (!foundUser) {
      console.log("User not found");
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (total, item) => total + item.newPrice * item.quantity,
      0
    );

    // Check if products are available in sufficient quantity
    const products = cartItems.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    for (const product of products) {
      const foundProduct = await ProductModel.findById(product.productId);
      if (!foundProduct || foundProduct.quantity < product.quantity) {
        console.log("Insufficient stock for one or more products");
        return errorResponse(
          res,
          "Insufficient stock for one or more products",
          StatusCodes.BAD_REQUEST
        );
      }
    }

    // Generate transaction reference
    const generateTxRef = () => {
      const randomString = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      return `txn_${randomString}_${timestamp}`;
    };

    // Prepare payment payload
    const paymentPayload = {
      tx_ref: generateTxRef(),
      amount: totalAmount,
      currency: "NGN",
      redirect_url: REDIRECT_URL,
      customer: {
        email: foundUser.email,
        phonenumber: foundUser.phoneNumber,
        name: foundUser.name,
      },
      customizations: cartItems.map((item) => ({
        title: item.name,
        description: item.description,
        logo: item.images[0],
      })),
      payment_options: "card, ussd, mobilemoneyghana",
      products: cartItems.map((item) => item._id),
    };

    // Make payment request
    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      paymentPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    // Update transaction status to "pending"
    // Update transaction status to "pending"
    const existingTransaction = await TransactionModel.findOne({
      ref: paymentPayload.tx_ref,
    });

    if (existingTransaction) {
      // Update existing transaction
      await TransactionModel.findOneAndUpdate(
        { ref: paymentPayload.tx_ref },
        { 
          amount: totalAmount,
          user: user.id,
          products: cartItems.map(item => ({
            product: item._id,
            quantity: item.quantity,
            price: item.newPrice
          }))
        }
        // { amount: totalAmount },
        // { user: user.id },
        

      );
    } else {
      // Create new transaction
      await TransactionModel.create({
        ref: paymentPayload.tx_ref,
        amount: totalAmount,
        user: user.id,
        products: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.newPrice
        }))
      });
    }

    const paymentLink = response.data;

    res.json({ callbackUrl: paymentLink });
  } catch (error) {
    if (
      error.response &&
      error.response.status === 400 &&
      error.response.data.message === "Expired link"
    ) {
      // Handle expired link error
      res.status(400).json({
        error:
          "Payment link has expired. Please request a new link to complete your payment.",
      });
    } else {
      console.error("Error processing payment:", error);
      res.status(500).json({ error: "Error processing payment" });
    }
  }
};

// Verify Payment from Flutterwave

// Function to calculate total price of cart items
const calculateTotalPrice = (cartItems) => {
  let totalPrice = 0;
  for (const item of cartItems) {
    totalPrice += item.newPrice * item.quantity;
  }
  return totalPrice;
};

export const verifyPaymentTransaction = async (req, res) => {
  try {
    const { transaction_id, tx_ref, cartItems, user } = req.body;

    if (!transaction_id) {
      return errorResponse(
        res,
        "Transaction ID is required",
        StatusCodes.NOT_FOUND
      );
    }

    // Verify transaction using Flutterwave's API
    const verificationResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    // Check if transaction has already been processed
    const existingTransaction = await TransactionModel.findOne({ ref: tx_ref });

    // Update transaction status in your database based on verification result
    if (verificationResponse.data.status === "success") {
      // Update transaction status to "completed" in your database
      await TransactionModel.findOneAndUpdate(
        { ref: tx_ref },
        { status: "completed" }
      );

      if (existingTransaction && existingTransaction.status === "completed") {
        // Transaction has already been successfully processed
        const result = verificationResponse.data.data;
        // console.log("result is : ", result)

        console.log("Transaction already verified");
        return successResponse(
          res,
          "Transaction already verified",
          result,
          StatusCodes.OK
        );
      } else {
        // Update user's purchased products
        const foundUser = await UserModel.findById(user.id);
        for (const item of cartItems) {
          foundUser.purchasedProducts.push(item._id);
        }
        await foundUser.save();

        // Update products' sales count and quantity
        for (const item of cartItems) {
          const foundProduct = await ProductModel.findById(item._id);
          foundProduct.salesCount += item.quantity;
          foundProduct.quantity -= item.quantity;
          await foundProduct.save();
        }

        // Create an order for the user
        const order = new OrderModel({
          user: foundUser.id,
          products: cartItems.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          totalPrice: calculateTotalPrice(cartItems),
          status: "processing",
        });

        await order.save();

        // Remove items from the cart
        await CartModel.findOneAndDelete({ user: user.id });

        const result = verificationResponse.data.data;
        // console.log("result is : ", result)

        return successResponse(
          res,
          "Transaction verified successfully",
          result,
          StatusCodes.OK
        );
      }
    } else {
      // Transaction verification failed, update status to "failed" in your database
      await TransactionModel.findOneAndUpdate(
        { ref: tx_ref },
        { status: "failed" }
      );
      return errorResponse(
        res,
        "Transaction verification failed",
        StatusCodes.BAD_REQUEST
      );
    }
  } catch (error) {
    console.error("Error verifying transaction:", error.message);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error verifying transaction: " + error.message
    );
  }
};



