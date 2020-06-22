const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name field is required"],
  },
  email: {
    type: String,
    required: [true, "Email field is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  photo: String,
  role: {
    type: String,
    default: "user",
    enum: ["user", "shop-admin", "seller", "staff"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false, // removes password from any response
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please provide confirm password"],
    validate: {
      // this only works on create and save and not on update
      validator: function (element) {
        return element === this.password;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Encrypt password and delete confirm password
userSchema.pre("save", async function (next) {
  // move to the next mongoose middleware if its not created new or updated

  if (!this.isModified("password")) return next();

  // only happens if password is been create new or update
  // salt() => bcrypt will add a random string to the password
  // so that 2 equal passwords do not generate the same hash

  this.password = await bcrypt.hash(this.password, 12); // salt value is 12

  // delete confirmPassword field
  this.passwordConfirm = undefined;
  next();
});

// check and write explanation for this middleware function
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
});

// all functions below are instant methods... available on all document of a certain collection

// Compare login password provided with user password in the DB
// encrypt.compare encrypts password provided by the user and compare it with the encrypted user password in the DB
userSchema.methods.comparePasswords = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if user changed password after token was issued
userSchema.methods.changedPasswordAfterTokenIssued = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimeStamp;
  }

  // password was not changed
  return false;
};

/** Password Reset Token
 * create token, set encrypted token in the DB
 * set expires date, 1 hour in mili seconds
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
