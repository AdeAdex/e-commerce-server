//  server/app.js

import express from "express";
import morgan from "morgan";
import cors from "cors";
import passport from "./passport.js"
// import cookieSession from "cookie-session"
import expressSession from "express-session";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "./utils/libs/response.lib.js";
import routes from "./routes/index.js";
import cookieParser from 'cookie-parser';

const app = express();


const corsOptions = {
  origin: ["https://www.adullamfashion.com", "https://adullam.vercel.app", "http://localhost:5173"], // Update with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Enable credentials (cookies, authorization headers, etc.)
};

// use middlewares
app.use(cors(corsOptions)); // Enable Cross-Origin Resource Sharing
app.use(morgan("dev"));  // Log HTTP requests to console for development
app.use(express.json());  // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true }));   // Parse URL-encoded requests
app.use(expressSession({  // Initialize Express session
  secret: 'secretKey',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());   // Initialize Passport authentication
app.use(passport.session());  // Persistent login sessions with Passport
// Parse cookies
app.use(cookieParser());


// Define API routes
app.use("/api", routes);

// index route
app.get("/", (_req, res) => {
  const responseMessage = `
    Welcome to the e-commerce platform server.
    Version: ${process.env.APP_VERSION || "1.0.0"}
    Environment: ${process.env.NODE_ENV || "development"}

    This API powers a comprehensive e-commerce platform with services for both customers and administrators, including:
      - **Product Listings**: Browse available products with details such as price, description, and stock availability.
      - **Cart Management**: Add, update, or remove products from your shopping cart.
      - **Order Processing**: Place and track orders with real-time status updates.
      - **Customer Authentication**: Secure login and registration features for customers.
      - **Admin Dashboard**: Manage products, track orders, and monitor store performance through a dedicated admin interface.
      - **Flutterwave Integration**: Seamless payment processing via Flutterwave, supporting multiple currencies and secure transactions.
      - **Payment Processing**: Enable secure payments through credit/debit cards, bank transfers, and other methods supported by Flutterwave.
      - **User Roles**: Differentiated access for customers and admins, ensuring the right privileges for each role.

    Developed by Adex. Please refer to the documentation for available endpoints and detailed usage instructions.
  `;
  successResponse(res, responseMessage, StatusCodes.OK);
});



// catch 404 errors and forward them to error handler
app.use((_req, _res, next) => {
  const error = new Error("Not Found");
  error.status = StatusCodes.NOT_FOUND;
  next(error);
});

// error handler function
app.use((error, _req, res, _next) => {
  res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR);
  res.json({
    error: {
      message: error.message,
    },
  });
});

export default app;
