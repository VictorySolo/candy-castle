// -- import modules
const mongoose = require("mongoose");
// - import DB modules
const Product = require("../models/product");

// --creating a productId/amount pair
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
});

// -- creating cartSchema with customerId and productId/amount pair
const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  items: [cartItemSchema],
});

// Method to calculate total price
cartSchema.methods.calculateTotalPrice = async function () {
  // -- variable to store the total price
  let totalPrice = 0;
  // -- reading all the productId/amount pairs in the cart
  for (const item of this.items) {
    const product = await Product.findById(item.productId);
    // -- calculating the price for each pair
    totalPrice += product.price * item.amount;
  }
  // -- returning the total price
  return totalPrice;
};

// -- creating Cart model
const Cart = mongoose.model("Cart", cartSchema);
// -- exporting the Cart model
module.exports = Cart;
