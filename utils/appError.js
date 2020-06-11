class AppError extends Error {
  /**
   * * constructor params are what will be passed into the new object
   * * created from the AppError class
   * * It is called each time a new object is created from the AppError class
   */

  constructor(message, statusCode) {
    // * super is called when we extend a parent class(Error in this case) and this calls the parent constructor function
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
