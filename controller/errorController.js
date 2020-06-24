const AppError = require("../utils/appError");

/**
 * @desc handles duplicate Database errors
 * @param {Object} err
 * @returns {Object} new AppError
 */
const handleDuplicateFieldsErrorDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400); // 400 Bad request
};

/**
 * @desc Handles cast error from Mongo
 * @param {Object} err
 * @returns {Object} new AppError
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.name}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * @desc Handles input validation errors from mongo
 * @param {Object} err
 * @returns {Object} new AppError
 */
const handleValidationErrorDB = (err) => {
  // loop over object and return message
  const errors = Object.values(err.errors).map((element) => element.message);

  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

/**
 * @desc Handles Invalid JWT token error
 * @returns {Object} new AppError
 */
const handleJWTError = () => {
  new AppError("Invalid token, Please log in again", 401);
};

/**
 * @desc Handles Expired JWT token error
 * @returns {Object} new AppError
 */
const handleJWTExpiredError = () => {
  new AppError("Your token has expired, Please log in again", 401);
};

/**
 * @desc Error messages sent in development
 * @param {Object} err
 * @param {Object} res
 */
const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  // Operation, trusted error, send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programming or unknown errors: aka BUGS: don't leak that to client
    console.log("ERROR 🥵 🐛", err);
    res.status(500).json({
      status: "error",
      message: "Something terrible happened, No worries, We've got this",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsErrorDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendProdError(error, res);
  }
};
