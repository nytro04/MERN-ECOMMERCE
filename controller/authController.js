const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

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

/**
 * login registered user
 * * sends JWT Token back
 */
exports.login = catchAsync(async (req, res, next) => {
  //  * 1. Get email and password from request body
  const { email, password } = req.body;

  //  * 2. check if email and password are provided
  if (!email) return next(new AppError("Please provide email", 400));
  if (!password) return next(new AppError("Please provide password", 400));

  //  * 3. check if user exist and password is correct
  //  * +password adds the removed (select false in DB) password back to user document
  const user = await User.findOne({ email }).select("+password");

  // Check is provided email exist on DB
  if (!user) return next(new AppError("Incorrect email or password"));

  //  * if email exist check if password is correct
  const correctPassword = await user.comparePasswords(password, user.password);

  // *  return error if password is not correct
  if (!correctPassword)
    return next(new AppError("Incorrect email or password"));

  //  * Log user in and send JWT if password is correct
  createAndSendToken(user, 200, res);
});
