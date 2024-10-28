const mongoose = require("mongoose");
// const Product = require("./product.js");  // -- possible doen't required

// -- orderSchema
const orderSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // connection with Product model of productSchema
        },
        amount: {
          type: Number,
          required: true,
          min: 1, // Ensure at least one product is ordered
        },
      },
    ],
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
      //   lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // connection with Customer model of customerSchema
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
const Order = mongoose.model("Order", orderSchema);

// -- export DB model
module.exports = Order;
