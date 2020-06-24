const mongoose = require("mongoose");
const validator = require("validator");

// * create resource schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product name is required"],
      trim: true,
      // unique: true // helps avoid duplication of fields
      minlength: [5, "Product name must be more than 5 characters"],
      maxlength: [100, "Product name must be less than 100 characters"],
      // for numbers and dates, we use min and max
      // validate: [validator.isAlpha, "Product name must contains only letters"]
    },
    price: {
      type: Number,
      required: [true, "A product price is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    // set virtuals to true on json and object
    // * virtuals are fields that are defined on the schema but are no persisted
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Mongoose middlewares(eg. document, query, aggregate, model) => are code
 * that runs before(pre) or after(post) each action
 * mongoose middleware also have the next() function to call the next
 * middleware in the middleware stack
 */

/**
 * post middleware has access to the just saved document (doc)
 * and are executed after all the pre middlewares are executed
 */

/** QUERY MIDDLEWARE
 * Query middlewares allow us to run functions before or after
 * a certain query(find, findOne) is executed. The "this" keyword here points
 * to the current query.
 */

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
