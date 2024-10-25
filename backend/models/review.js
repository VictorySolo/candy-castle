const mongoose = require("mongoose");
// const Product = require("./product.js");  // -- possible doen't required
// const Customer = require("./customer.js");  // -- possible doen't required

// -- orderSchema
const reviewSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    products: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // connection with Product module of productSchema
    },

    comment: {
      type: String,
      required: true,
      //   lowercase: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Must be at least 1 or more, you entered {VALUE}"],
      max: [5, "Must be at most 5 or less, you entered {VALUE}"],
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // connection with Customer module of customerSchema
    },
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
const Review = mongoose.model("Review", reviewSchema);

// -- export DB model
module.exports = Review;
