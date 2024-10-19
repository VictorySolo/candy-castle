// -- import modules
const Customer = require("../models/customer");
const Order = require("../models/order");
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
    const customers = await Customer.findAll();
    if (!customers || customers.length === 0) {
      return next(new HttpError("No customers found", 404));
    }
    // -- returning a list of all customers
    res.status(200).json(customers);
  } catch (err) {
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
      next(new HttpError("Not enough data for creating a customer", 400));
    }
    // -- password validation using regex
    if (!passwordREGX.test(password)) {
      next(
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
      next(new HttpError("A problem occured while creating a customer", 500));
    }
    // -- returning created customer data
    res.status(200).json(customer); // probably need to return only a OK messageS
  } catch (err) {
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
        next(
          new HttpError("Validation error: password is not strong enough", 404)
        );
      }
      // -- hashing the password using bcrypt
      newPassword = await bcrypt.hash(password, saltRounds);
    }
    // -- updating customer's data in the database
    await Customer.findByIdAndUpdate(
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
    if (!updatedCustomer) {
      return next(
        new HttpError("Customer was not found or update failed", 404)
      );
    }
    // -- succesfully updated message
    res.status(200).json("Updated successfully");
  } catch (err) {
    next(err);
  }
};

// -- deleting customer by id function
const deleting = async (req, res, next) => {
  try {
    // -- reading id from request
    const id = req.params.id;
    // -- deleting customer by id from the database
    Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return next(new HttpError("Customer not found or deleting failed", 404));
    }
    // -- succesfully deleted message
    res.status(200).json("Deleted successfully");
  } catch (err) {
    next(err);
  }
};

// -- getting all orders by customer id function
const allOrders = async (req, res, next) => {
  try {
    // -- reading id from request
    const id = req.params.id;
    // -- finding customer by id in the database and populate orders relation
    const customer = await Customer.findById(id).populate("orders");
    if (!customer) {
      return next(new HttpError("Couldn't find customer", 404));
    }
    // -- returning customer's orders
    res.status(200).json(customer.orders);
  } catch (err) {
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
