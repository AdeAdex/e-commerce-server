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
// import { cacheMiddleware } from "./middlewares/cacheMiddleware.js";
// import { hjdf } from "./utils/libs/ssr.js";   // Import the SSR function
// import { generateStructuredData } from "./utils/libs/structuredData.js";
// import { generateXMLSitemap } from "./utils/libs/sitemap.js";

// import CryptoJS from 'crypto-js';

// // Your secret key
// const secretKey = 'FLWSECK_TEST-6213770d3334139fe355b672604e4a13-X';

// // Generate the hash using SHA-256
// const secretHash = CryptoJS.SHA256(secretKey).toString(CryptoJS.enc.Hex);

// console.log('Secret Hash:', secretHash);

// 510e6f7931825d641ca8208caf7ee9dd6a0fbe1f3d5d2de12f674308419f5258


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



// Server-Side Rendering (SSR) Route
// app.get("/", cacheMiddleware, async (req, res) => {
//   try {
//     // Render page with SSR function
//     const { html, metaTags } = await renderPageWithSSR(req.url); // Render page with SSR function

//     // Generate structured data
//     const structuredData = generateStructuredData("Page Title", "Page Description", req.url);

//     // Send HTML response with dynamically generated meta tags
//     res.send(`
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <meta http-equiv="X-UA-Compatible" content="ie=edge">
//           <title>Adullam Site</title>
//           ${metaTags} <!-- Include dynamically generated meta tags -->
//       </head>
//       <body>
//           <div id="root">${html}</div>
//       </body>
//       </html>
//     `);
//   } catch (error) {
//     console.error("Error during SSR:", error);
//     // Render fallback content in case of error
//     res.send(`
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <meta http-equiv="X-UA-Compatible" content="ie=edge">
//           <title>Adullam Site</title>
//       </head>
//       <body>
//           <div id="root">Error occurred. Please try again later.</div>
//       </body>
//       </html>
//     `);
//   }
// });

// Call the function to generate XML sitemap
// generateXMLSitemap();


// index route
app.get("/", (_req, res) => {
  successResponse(res, "Welcome to Adullam Site", StatusCodes.OK);
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
