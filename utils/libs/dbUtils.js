// dbUtils.js

import UserModel from "../../models/user.model.js";
import TransactionModel from "../../models/transaction.model.js";

export async function getTotalUsers() {
  return await UserModel.countDocuments({});
}

export async function getTotalTransactions() {
  return await TransactionModel.countDocuments({});
}

export async function getTotalSales() {
  return await TransactionModel.aggregate([
    {
      $match: { status: { $in: ["completed", "delivered"] } },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
}

export async function getUsersRegisteredOnDayBefore(oneDayBefore, currentDate) {
  return await UserModel.countDocuments({
    createdAt: {
      $gte: oneDayBefore,
      $lt: currentDate,
    },
  });
}

export async function getTransactionsOnDayBefore(oneDayBefore, currentDate) {
  return await TransactionModel.countDocuments({
    createdAt: {
      $gte: oneDayBefore,
      $lt: currentDate,
    },
  });
}

export async function getTotalSalesOnDayBefore(oneDayBefore, currentDate) {
  return await TransactionModel.aggregate([
    {
      $match: {
        createdAt: {
          $gte: oneDayBefore,
          $lt: currentDate,
        },
        status: { $in: ["completed", "delivered"] },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
}
