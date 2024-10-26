const mongoose = require("mongoose");
// const Order = require("./order.js");  // -- possible doen't required

// -- define regex validation pattern for emai, password and phone number
const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format
  phone: /^05\d{8}$/, // phone number 05xxxxxxxx
};

// -- customerSchema
const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      // lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      // lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validationPatterns.email.test(value);
        },
        message: "Invalid email address.",
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      // we can't use regex password validation here. We store a hash not a password itself
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Must be at least 1 or more, you entered {VALUE}"],
      default: 1,

      validate: {
        validator: function (value) {
          return value >= 0;
        },
        message: "Incorrect age. Age must be a number starting from 1.",
      },
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      // Custom validation function
      validate: {
        validator: function (value) {
          return validationPatterns.phone.test(value);
        },
        message: "Invalid phone number.",
      },
    },
    deliveryAddress: {
      type: String,
      // lowercase: true,
      trim: true,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order", // connection with Order module of orderSchema
      },
    ],
  },
  {
    methods: {
      // method
      async exampleMethod() {
        return null;
      },
    },
  }
);

// -- creating mongoose model
const Customer = mongoose.model("Customer", customerSchema);

// -- export DB model
module.exports = Customer;
