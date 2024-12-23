// -- import DB models
const Order = require("../models/order");
const Customer = require("../models/customer");
const Cart = require("../models/cart");
const Product = require("../models/product");

// -- creating a new order for a customer (only for current customer)
const createNewOrder = async (req, res, next) => {
  try {
    // -- getting deliveryAddress from the request
    const { deliveryAddress } = req.body;
    // -- getting customerId from session
    const customerId = req.session.customerId;
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
    res.status(201).json({ status: "success", order: responseOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// -- canceling an order by ID
const cancelOrder = async (req, res, next) => {
  try {
    // -- getting orderId from request
    const orderId = req.params.id;
    // -- looking for the order by ID
    const order = await Order.findById(orderId).populate("products.product");

    // -- if order doesn't exist send a message to client
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // -- getting customerId from session
    const loggedInCustomerId = req.session.customerId;
    // -- searching logged in customer in the DB
    const loggedInCustomer = await Customer.findById(loggedInCustomerId);
    // -- logged in customer is not in the DB
    if (!loggedInCustomer) {
      return res.status(401).json({ message: "Unauthorized: Please log in" });
    }

    // -- checking if current customer has rights to cancel requested order
    if (
      !loggedInCustomer.isAdmin &&
      order.customer.toString() !== loggedInCustomerId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only cancel your own orders" });
    }

    // -- updating product amounts
    for (const item of order.products) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.amount += item.amount;
        // -- this line should be discussed with the owner of the candy-store
        product.availability = true;
        await product.save();
      }
    }

    // -- getting customerId from the order
    const customerId = order.customer;
    // -- removing the order from the customer's order list
    await Customer.findByIdAndUpdate(customerId, {
      $pull: { orders: orderId },
    });

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
