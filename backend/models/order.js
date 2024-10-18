const mongoose = require("mongoose");
// const Product = require("./product.js");  // -- possible doen't required

// -- customerSchema
const orderSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // connection with Product module of productSchema
      },
    ],
    deliveryAddress: {
      type: String,
      required: true,
      //   lowercase: true,
    },
    price: {
      type: Number,
      required: true,
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
