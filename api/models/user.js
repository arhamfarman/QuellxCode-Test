const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//@ Descritption: This is the User profile
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
      "Please use a valid email",
    ],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  salary: {
    type: Number,
  },
  tax: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt Password using Bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtTokens = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set Expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  console.log(resetToken);

  return resetToken;
};

// Generate and hash password token
UserSchema.methods.getVerfiyToken = function () {
  //Generate token
  const verifToken = crypto.randomBytes(20).toString("hex");

  //Hash token and set to resetPasswordToken field
  this.verifToken = crypto
    .createHash("sha256")
    .update(verifToken)
    .digest("hex");

  // Set Expire
  this.verifTokenExpire = Date.now() + 10 * 60 * 1000;

  console.log(verifToken);

  return verifToken;
};

module.exports = mongoose.model("User", UserSchema);
