// server/controllers/order.controller.js

import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "../utils/libs/response.lib.js";
import tryCatchLib from "../utils/libs/tryCatch.lib.js";
import TransactionModel from "../models/transaction.model.js";

/**
 * Controller function for user to get a particular orders made 
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const getUserOrders = tryCatchLib(async (req, res) => {
  const userId = req.params.userId; // Assuming userId is passed in the request params
  console.log(userId);

  try {
    // Find all transactions/orders made by the user
    const orders = await TransactionModel.find({ user: userId }).populate({
      path: "products",
      select: "name description _id images quantity newPrice createdAt", // Specify the fields you want to populate
    });

    if (!orders || orders.length === 0) {
      return errorResponse(
        res,
        "No orders found for this user",
        StatusCodes.NOT_FOUND
      );
    }

    return successResponse(
      res,
      "Orders fetched successfully",
      orders,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(
      res,
      "Failed to fetch orders",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * Controller function for admin to get all orders made by the user's
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */

export const getAllOrdersByAdmin = tryCatchLib(async (req, res) => {
  try {
    // Find all transactions/orders made by the user
    const orders = await TransactionModel.find({}).populate({
      path: "products",
      select: "name description _id images quantity newPrice createdAt", // Specify the fields you want to populate
    });

    if (!orders || orders.length === 0) {
      return errorResponse(
        res,
        "No orders found for this user",
        StatusCodes.NOT_FOUND
      );
    }

    return successResponse(
      res,
      "Orders fetched successfully",
      orders,
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(
      res,
      "Failed to fetch orders",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});



/**
 * Controller function for admin to update order status
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */
export const updateOrderStatusByAdmin = tryCatchLib(async (req, res) => {
  const orderId = req.params.orderId; // Assuming orderId is passed in the request params
  const { status } = req.body; // Assuming the new status is passed in the request body

  try {
    // Find the transaction/order by ID
    const order = await TransactionModel.findById(orderId);

    if (!order) {
      return errorResponse(
        res,
        "Order not found",
        StatusCodes.NOT_FOUND
      );
    }

    // Check if the new status is valid
    if (!['pending', 'completed', 'processing', 'delivered', 'cancelled'].includes(status)) {
      return errorResponse(
        res,
        "Invalid status",
        StatusCodes.BAD_REQUEST
      );
    }

    // Update the order status
    order.status = status;
    await order.save();

    return successResponse(
      res,
      "Order status updated successfully",
      order,
      StatusCodes.OK
    );
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Failed to update order status",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});


/**
 * Controller function for admin to get total sales
 * @param {Object} req The request object.
 * @param {Object} res The response object.
 * @returns {Object} The response object.
 */
export const getTotalSales = tryCatchLib(async (req, res) => {
  try {
    // Find all completed transactions
    const completedTransactions = await TransactionModel.find({ status: { $in: ['completed', 'delivered'] } });

    // Calculate total sales
    let totalSales = 0;
    completedTransactions.forEach(transaction => {
      totalSales += transaction.amount;
    });

    return successResponse(
      res,
      "Total sales fetched successfully",
      { totalSales },
      StatusCodes.OK
    );
  } catch (error) {
    console.log(error.message);
    return errorResponse(
      res,
      "Failed to fetch total sales",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
});
