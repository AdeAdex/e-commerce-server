// server/index.js

import "dotenv/config"; // import dotenv
import http from "http";
import app from "./app.js"; // import express app
import connectDB from "./config/database.config.js"; // import database connection

const PORT = process.env.PORT || 5500;

const server = http.createServer(app); // create server

const startServer = async () => {
  try {
    // connect to database
    await connectDB();

    // start server
    server.listen(PORT, () => {
      console.log(`🟢 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`🔴 Server connection failed: ${error}`);
  }
};
startServer();
