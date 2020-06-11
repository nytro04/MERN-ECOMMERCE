const express = require("express");

/**
 * Router
 * They are Middlewares that handles routes to specific resources eg. userRoutes, productRoutes
 */

const router = express.Router();

/**
 * User Resources routes
 * these routes are handled by the user Routes(middlewares) in the app.js.
 */

// Sign Up or Register new User
router.post("/signup", sigup);
