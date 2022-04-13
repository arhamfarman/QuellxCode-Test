const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
  },
  tax: {
    type: Number,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

EmployeeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Employee", EmployeeSchema);
