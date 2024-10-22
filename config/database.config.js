// server/config/database.config.js

import mongoose from "mongoose";
import { config } from "dotenv";
config();

const mongoose_URI = process.env.DB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoose_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("mongoose connected successfully 💾");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;