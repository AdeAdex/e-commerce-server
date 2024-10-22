// server/controllers/cart.controller.js

import { StatusCodes } from "http-status-codes";
import CartModel from "../models/cart.model.js";
import UserModel from "../models/user.model.js";
import { errorResponse, successResponse } from "../utils/libs/response.lib.js";
import ProductModel from "../models/product.model.js";

export const addItemToCart = async (req, res) => {
  const { productId, quantity, userId } = req.body;
  //   const userId = req.user._id;
  // console.log(req.body)

  try {
    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }

    // Check if the product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return errorResponse(res, "Product not found", StatusCodes.NOT_FOUND);
    }

    // Check if the requested quantity is available for the product
    if (product.quantity < quantity) {
      return errorResponse(
        res,
        "Requested quantity exceeds available stock",
        StatusCodes.BAD_REQUEST
      );
    }

    // Calculate total price based on quantity
    const totalPrice = product.newPrice * quantity;

    // Check if the product is already in the user's cart
    const existingCartItem = await CartModel.findOne({
      user: userId,
      "items.product": productId,
    });

    if (existingCartItem) {
      // Update the quantity of the existing cart item
      const itemToUpdate = existingCartItem.items.find((item) =>
        item.product.equals(productId)
      );
      itemToUpdate.quantity += quantity;
      itemToUpdate.totalPrice += totalPrice;
      await existingCartItem.save();
    } else {
      // Create a new cart item and add it to the user's cart
      const newCartItem = { product: productId, quantity, totalPrice };
      await CartModel.findOneAndUpdate(
        { user: userId },
        { $push: { items: newCartItem } },
        { upsert: true }
      );
    }

    return successResponse(
      res,
      "Product added to cart successfully",
      null,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(
      res,
      "Failed to add product to cart",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const reduceItemInCart = async (req, res) => {
  const { productId, userId } = req.params;
  const { quantity } = req.body

  try {
    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }

    // Check if the product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return errorResponse(res, "Product not found", StatusCodes.NOT_FOUND);
    }

    // Check if the item is already in the user's cart
    const existingCartItem = await CartModel.findOne({
      user: userId,
      "items.product": productId,
    });

    if (!existingCartItem) {
      return errorResponse(res, "Item not found in cart", StatusCodes.NOT_FOUND);
    }

    // Find the item in the cart and reduce its quantity
    const itemToUpdate = existingCartItem.items.find((item) =>
      item.product.equals(productId)
    );

    if (!itemToUpdate) {
      return errorResponse(res, "Item not found in cart", StatusCodes.NOT_FOUND);
    }

    if (itemToUpdate.quantity < quantity) {
      return errorResponse(res, "Requested quantity exceeds cart quantity", StatusCodes.BAD_REQUEST);
    }

    // Update the quantity of the item in the cart
    itemToUpdate.quantity -= quantity;
    itemToUpdate.totalPrice -= product.newPrice * quantity;

    // If the updated quantity is zero, remove the item from the cart
    if (itemToUpdate.quantity === 0) {
      existingCartItem.items.pull({ product: productId });
    }

    await existingCartItem.save();

    return successResponse(
      res,
      "Item quantity reduced successfully",
      null,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(
      res,
      "Failed to reduce item quantity in cart",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};


export const getCartItems = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check if the user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }

    // Fetch the user's cart
    const cart = await CartModel.findOne({ user: userId }).populate(
      "items.product"
    );
    if (!cart) {
      return successResponse(
        res,
        "Cart is empty",
        { cartItems: [] },
        StatusCodes.OK
      );
    }

    return successResponse(
      res,
      "Cart items retrieved successfully",
      { cartItems: cart.items },
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error.message);
    return errorResponse(
      res,
      "Failed to retrieve cart items",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export const removeItemFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const user = await UserModel.findById({ _id: userId });

    if (!user) {
      return errorResponse(res, "User not found", StatusCodes.NOT_FOUND);
    }
    // Find the user's cart
    const cart = await CartModel.findOne({ user: userId });

    if (!cart) {
      return errorResponse(res, "Cart not found", StatusCodes.NOT_FOUND);
    }

    // Check if the item exists in the cart
    const existingItem = cart.items.find((item) =>
      item.product.equals(productId)
    );

    if (!existingItem) {
      return errorResponse(
        res,
        "Item not found in cart",
        StatusCodes.NOT_FOUND
      );
    }

    // Remove the item from the cart
    cart.items = cart.items.filter((item) => !item.product.equals(productId));

    // Save the updated cart
    await cart.save();

    return successResponse(
      res,
      "Item removed from cart successfully",
      null,
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error.message);
    return errorResponse(
      res,
      "Failed to remove item from cart",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};
