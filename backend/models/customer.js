const mongoose = require("mongoose");
// const Order = require("./order.js");  // -- possible doen't required

// -- define regex validation pattern for emai, password and phone number
const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email format
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // Strong password pattern
  phone: /^05\d{8}$/, // phone number 05xxxxxxxx
};

// -- customerSchema
const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      // lowercase: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      // lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value) {
          return validationPatterns.email.test(value);
        },
        message: "Invalid email address.",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (value) {
          return validationPatterns.strongPassword.test(value);
        },
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&).",
      },
    },
    age: {
      type: Number,
      required: true,
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
      required: true,
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
module.exports = Customer;
