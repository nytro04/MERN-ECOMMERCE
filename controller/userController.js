const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

/**
 * @desc filter out properties that must not be included in update,
 * @param {req.body} req.body
 * @param  {Array} allowedFields properties to be updated
 * @return {Object} newObj
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

/**
 * Users Routes Handler Functions
 * handles routes to the various users endpoints
 *
 * exports.funcName allows you to export a single function
 *
 * @param {object} req
 * @param {object} res
 */

 // Logged in users update their info but not passwords 
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. Return error if user POSTS password or password confirm
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "This route is not for password updates, Please user /updateMyPassword",
        400
      )
    ); // 400 is bad request
  }

  // 2. filter out fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  // 3. Update User info eg. name, email
  // 4. We user findById because this activity is done by Logged in users
  // and their id comes from the protected middleware

  const updatedUser = User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Fetch all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: {
      user: users,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
