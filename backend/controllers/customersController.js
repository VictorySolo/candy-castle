// -- import modules
const Customer = require("../models/customer");
// -- extended Error class import
const HttpError = require("../services/HttpError");
// -- adding bcrypt for password hashing
const bcrypt = require("bcrypt");
// -- dotenv for environment variables import
require("dotenv").config();
// -- bcrypt salt rounds for password hashing
const saltRounds = parseInt(process.env.SALT_ROUNDS);
// -- regex for password rules
const passwordREGX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// -- geting all customers function
const gettingAll = async (req, res, next) => {
  try {
    const customers = await Customer.find();
    if (!customers || customers.length === 0) {
      return next(new HttpError("No customers found", 404));
    }
    // -- returning a list of all customers
    res.status(200).json(customers);
  } catch (err) {
    console.log("Error getting all customers (gettingAll)");
    // -- handling the error
    next(err);
  }
};

// -- creating new customer function
const creating = async (req, res, next) => {
  try {
    // -- getting parameters from the request
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      phone,
      deliveryAddress,
    } = req.body;
    // -- checkong if all the required in customerSchema data exists
    if (!firstName || !lastName || !email || !password || !age || !phone) {
      return next(
        new HttpError("Not enough data for creating a customer", 400)
      );
    }
    // -- password validation using regex
    if (!passwordREGX.test(password)) {
      return next(
        new HttpError("Validation error: password is not strong enough", 404)
      );
    }
    // -- hashing the password using bcrypt
    const newPassword = await bcrypt.hash(password, saltRounds);
    // -- creating new customer in the database
    const customer = await Customer.create({
      firstName,
      lastName,
      age,
      phone,
      email,
      deliveryAddress,
      password: newPassword,
    });
    if (!customer) {
      return next(
        new HttpError("A problem occured while creating a customer", 500)
      );
    }
    // -- returning created customer data
    res.status(200).json(customer); // probably need to return only a OK messageS
  } catch (err) {
    console.log("Error creating a customer (creating)");
    // -- handling the error
    next(err);
  }
};

// -- getting customer by id function
const gettingById = async (req, res, next) => {
  try {
    // -- reading id from request
    const id = req.params.id;
    // -- finding customer by id in the database
    const customer = await Customer.findById(id);
    if (!customer) {
      return next(new HttpError("Couldn't find the customer", 404));
    }
    // -- returning customer data
    res.status(200).json(customer);
  } catch (err) {
    console.log("Error getting a customer by ID (gettingById)");
    // -- handling the error
    next(err);
  }
};

// -- updating customer by id function
const updating = async (req, res, next) => {
  try {
    // -- global variable for the new password hash
    let newPassword;
    // -- reading id from request
    const id = req.params.id;
    // -- getting parameters from the request
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      phone,
      deliveryAddress,
    } = req.body;
    // -- if password must be updated
    if (password) {
      // -- password validation using regex
      if (!passwordREGX.test(password)) {
        return next(
          new HttpError("Validation error: password is not strong enough", 404)
        );
      }
      // -- hashing the password using bcrypt
      newPassword = await bcrypt.hash(password, saltRounds);
    }
    // -- updating customer's data in the database
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        password: newPassword,
        age,
        phone,
        deliveryAddress,
      },
      { new: true }
    );
    // -- checking if customer was found and updated successfully
    if (!updatedCustomer) {
      return next(
        new HttpError("Customer was not found or update failed", 404)
      );
    }
    // -- succesfully updated message
    res.status(200).json("Updated successfully");
  } catch (err) {
    console.log("Error updating customer's data (updating)");
    // -- handling the error
    next(err);
  }
};

// -- deleting customer by id function
const deleting = async (req, res, next) => {
  try {
    // -- reading id from request
    const id = req.params.id;
    // -- deleting customer by id from the database
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return next(new HttpError("Customer not found or deleting failed", 404));
    }
    // -- succesfully deleted message
    res.status(200).json("Deleted successfully");
  } catch (err) {
    console.log("Error deleting a customer (deleting)");
    // -- handling the error
    next(err);
  }
};

// -- getting all orders by customer id function
const allOrders = async (req, res, next) => {
  try {
    // -- reading id from request
    const id = req.params.id;
    // -- finding customer by id in the database and populate orders relation

    const customer = await Customer.findById(id)
      .populate({
        path: "orders",
        populate: {
          path: "products.product",
          select: "name",
        },
      })
      .select("firstName lastName email orders");

    // Modify the orders to remove _id fields
    const orders = customer.orders.map((order) => ({
      date: order.date,
      products: order.products.map((product) => ({
        name: product.product.name,
        amount: product.amount,
      })),
      deliveryAddress: order.deliveryAddress,
      price: order.price,
      customer: order.customer,
    }));

    // -- returning customer's orders
    res.status(200).json({
      customerName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      orders: orders,
    });
  } catch (err) {
    console.log("Error getting all orders of the customer (allOrders)");
    // -- handling the error
    next(err);
  }
};

// -- exporting all functions
module.exports = {
  allOrders,
  gettingById,
  gettingAll,
  updating,
  deleting,
  creating,
};
