const express = require("express");

const {
  signup,
  login,
  forgetPassword,
  resetPassword,
  protect,
  updatePassword,
} = require("./../controller/authController");
const {
  updateMe,
  deleteMe,
  getAllUsers,
} = require("../controller/userController");

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
router.post("/signup", signup);

// User login
router.post("/login", login);

// forgot password
router.post("/forgotPassword", forgetPassword);

// reset password
router.patch("/resetPassword/:token", resetPassword);

// Update logged in users password
router.patch("/updateMyPassword", protect, updatePassword);

// Update logged In user info
router.patch("/updateMe", protect, updateMe);

// Users delete their account (soft delete)
router.delete("/deleteMe", protect, deleteMe);

router.route("/").get(getAllUsers).post(createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
