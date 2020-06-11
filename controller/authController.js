const jwt = require("jsonwebtoken");
const catchAsync = require("./../utils/catchAsync");
const User = require("./../models/userModel");

/**
 * Sign JWT => sign JWT token
 * * JWT Secret should be 32 characters long
 * * the payload here is the user id
 * * Expires in, is a security feature that logs user out after some time eg. 30d(days), 10h(hours) 30m(minutes) etc
 *
 * @param {String} id
 * @returns {*} JWT Token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * * Create JWT Token and send response *** Makes code DRY
 *
 * @param {Object} user
 * @param {Number} http Status Code eg. 201
 * @param {res Object} response object
 */
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

/**
 * Sign Up new User
 * * create new User and returns JWT and user data
 * @returns {*} JWT Toke and user
 */

exports.signup = catchAsync(async (req, res, next) => {
  // * get user details from the request body
  const { role, name, email, password, passwordConfirm } = req.body;

  // * create new user from User.create mongoose method
  const newUser = await User.create({
    role,
    name,
    email,
    password,
    passwordConfirm,
  });

  createAndSendToken(newUser, 201, res);
});
