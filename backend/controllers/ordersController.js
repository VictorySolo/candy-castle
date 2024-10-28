// -- import DB models
const Order = require("../models/order");
const Customer = require("../models/customer");
const Cart = require("../models/cart");

// -- creating a new order for a customer
const createNewOrder = async (req, res) => {
  try {
    // -- getting parameters from the request
    const { customerId, deliveryAddress } = req.body;
    // -- looking for the customer's cart
    const cart = await Cart.findOne({ customerId }).populate("items.productId");
    // -- if the cart doesn't exist send a message to client
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // -- calculating total price of the order
    const totalPrice = await cart.calculateTotalPrice();

    // -- create the new order in the DB
    const newOrder = await Order.create({
      date: new Date(),
      products: cart.items.map((item) => ({
        product: item.productId,
        amount: item.amount,
      })),
      deliveryAddress,
      price: totalPrice,
    });

    // -- adding the new order to the customer's order list
    await Customer.findByIdAndUpdate(customerId, {
      $push: { orders: newOrder._id },
    });
    // uncomment if the line above doesn't work
    // const customer = await Customer.findById(customerId);
    // customer.orders.push(newOrder._id);
    // await customer.save();

    // -- clearing the customer's cart
    cart.items = [];
    await cart.save();
    // -- Order created response to the client
    res.status(201).json({ message: "Order created", order: savedOrder });
  } catch (error) {
    console.log("Error creating order");
    // -- handling the error
    next(error);
  }
};

// -- canceling an order by ID
const cancelOrder = async (req, res) => {
  try {
    // -- getting parameters from request
    const { orderId, customerId } = req.body;
    // -- lloking for the order by ID
    const order = await Order.findById(orderId);
    // -- if order doesn't exist send a message to client
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // -- removing the order from the customer's order list
    await Customer.findByIdAndUpdate(customerId, {
      $pull: { orders: orderId },
    });
    // uncomment if the line above doesn't work
    // const customer = await Customer.findById(customerId);
    // customer.orders = customer.orders.filter((id) => id.toString() !== orderId);
    // await customer.save();

    // -- deleting the order from the DB
    await order.remove();
    // -- Order cancelled response to the client
    res.status(200).json({ message: "Order cancelled" });
  } catch (error) {
    console.log("Error cancelling order");
    // -- handling the error
    next(error);
  }
};
// -- exporting all functions
module.exports = {
  createNewOrder,
  cancelOrder,
};
