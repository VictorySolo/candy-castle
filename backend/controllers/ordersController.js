// -- import DB models
const Order = require("../models/order");
const Customer = require("../models/customer");
const Cart = require("../models/cart");
const Product = require("../models/product");

// -- creating a new order for a customer
const createNewOrder = async (req, res, next) => {
  try {
    // -- getting parameters from the request
    const { customerId, deliveryAddress } = req.body;
    // -- checking if all necessary parameters exist
    if (!customerId || !deliveryAddress) {
      return res.status(400).json({ message: "Not enough parameters" });
    }
    // -- looking for the customer's cart
    const cart = await Cart.findOne({ customerId }).populate("items.productId");
    // -- if the cart doesn't exist send a message to client
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // -- checking if the amounts of products in the cart are available and updating them
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (item.amount > product.amount) {
        return res
          .status(400)
          .json({ message: `Not enough amount of ${product.name}` });
      }
      product.amount -= item.amount;
      if (product.amount === 0) {
        product.availability = false;
      }
      await product.save();
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
      customer: customerId,
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
    // -- formatting the response
    const responseOrder = {
      date: newOrder.date,
      products: newOrder.products.map((item) => ({
        id: item.product._id,
        name: item.product.name,
        amount: item.amount,
        price: item.product.price,
      })),
      deliveryAddress: newOrder.deliveryAddress,
      price: newOrder.price,
      customer: newOrder.customer,
    };
    // -- Order created response to the client
    res.status(201).json({ message: "Order created", order: responseOrder });
  } catch (error) {
    console.log("Error creating order");
    // -- handling the error
    next(error);
  }
};

// -- canceling an order by ID
const cancelOrder = async (req, res) => {
  try {
    // -- getting orderId from request
    const orderId = req.params.id;
    // -- looking for the order by ID
    const order = await Order.findById(orderId);
    // -- if order doesn't exist send a message to client
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // -- getting customerId from the order
    const customerId = order.customer;
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
