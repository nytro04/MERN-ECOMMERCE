const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendMail = require("../utils/email");

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
 * @desc sends JWT Token back
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

/**
 * @desc allows only logged in users to access specified routes
 * @returns authenticated and authorize users
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Check if token exist
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // if logged in
  if (!token) {
    return next(new AppError("You are not logged in!, Please log in", 401)); // frontend should show message and redirect after some few seconds
  }

  // 2. Verify token
  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3. check if user still exist on DB
  const currentUser = await User.findById(decodedPayload.id);

  if (!currentUser) {
    return next(
      new AppError("The user who owns this token no longer exist", 401)
    ); // frontend should show message and redirect to login after some few seconds
  }

  //4. Check if user changed password after token was issued
  if (currentUser.changedPasswordAfterTokenIssued(decodedPayload.iat)) {
    return next("User recently changed password, Please log in again", 401); // frontend should show message and redirect to login after some few seconds
  }

  // 5. add user to req
  req.user = currentUser;

  // Grant access to protected routes
  next();
});

/**
 * @desc restrict some actions to specific users
 * @param  {array} roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permissions to perform this action")
      ); // frontend wont show these routes
    }

    return next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1. Get user by email
  const user = await User.findOne({ email: req.body.email });

  // 2. check if user exist
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  // 3. generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 4. send token to user email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  // message to user who forgot or lost password
  const message = `
  We heard that you lost your GuardSys password. Sorry about that!\n
  But don’t worry! You can use the following link to reset your password: \n

  ${resetURL} \n

  Please note that the link valid for 24 hours. \n

  Please ignore this message if you did not forget your password. \n

  Thanks\n
  Team at CommerceWorld
  `;

  try {
    await sendMail({
      email: user.email,
      subject: "Password reset Instructions",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.createPasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending reset email, Please try again",
        500
      )
    );
  }
});
