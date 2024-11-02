// -- import models
const Customer = require("../models/customer");
// -- importing mongoose
const mongoose = require("mongoose");
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

// -- geting all customers function (only for admin)
const gettingAll = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const loggedInCustomerId = req.session.customerId;
    // -- searching logged in customer in the DB
    const loggedInCustomer = await Customer.findById(loggedInCustomerId);
    // -- logged in customer is not in the DB or is not admin
    if (!loggedInCustomer || !loggedInCustomer.isAdmin) {
      return next(
        new HttpError("Forbidden: Only admins can access this resource", 403)
      );
    }

    // -- fetching all customers
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
      isAdmin,
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

    // -- setting isAdmin based on logged-in user's status
    let adminFlag = false;
    if (req.session.customerId) {
      // -- getting customerId from session
      const loggedInCustomerId = req.session.customerId;
      // -- searching logged in customer in the DB
      const loggedInCustomer = await Customer.findById(loggedInCustomerId);
      // -- if current user is admin and isAdmin exists
      if (
        loggedInCustomer &&
        loggedInCustomer.isAdmin &&
        isAdmin !== undefined
      ) {
        adminFlag = isAdmin;
      }
    }
    // -- creating new customer in the database
    const customer = await Customer.create({
      firstName,
      lastName,
      age,
      phone,
      email,
      deliveryAddress,
      isAdmin: adminFlag,
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
    // -- checking for duplicate key error
    if (err.code && err.code === 11000) {
      // -- handling duplicate email error
      return next(
        new HttpError(
          "This email is already registered. Please use a different email.",
          409
        )
      );
    }
    // -- handling the error
    next(err);
  }
};

// -- getting customer by id function
const gettingById = async (req, res, next) => {
  try {
    // -- reading id from request
    const id = req.params.id;
    // -- Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Invalid customer ID format", 400));
    }

    // -- getting customerId from session
    const loggedInCustomerId = req.session.customerId;
    // -- searching logged in customer in the DB
    const loggedInCustomer = await Customer.findById(loggedInCustomerId);
    // -- logged in customer is not in the DB
    if (!loggedInCustomer) {
      return next(new HttpError("Logged-in customer not found", 401));
    }

    // -- checking if current customer has rights to request customer's data
    if (!loggedInCustomer.isAdmin && loggedInCustomerId.toString() !== id) {
      return next(
        new HttpError(
          "Forbidden: You can only access your own information",
          403
        )
      );
    }
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
    // -- Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Invalid customer ID format", 400));
    }
    // -- getting parameters from the request
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      phone,
      deliveryAddress,
      isAdmin,
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

    // -- getting customerId from session
    const loggedInCustomerId = req.session.customerId;
    // -- searching logged in customer in the DB
    const loggedInCustomer = await Customer.findById(loggedInCustomerId);
    // -- logged in customer is not in the DB
    if (!loggedInCustomer) {
      return next(new HttpError("Logged-in customer not found", 401));
    }

    // -- checking if current customer has rights to update requested customer data
    if (!loggedInCustomer.isAdmin && loggedInCustomerId.toString() !== id) {
      return next(
        new HttpError(
          "Forbidden: You can only update your own information",
          403
        )
      );
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
        // Update isAdmin only if the user is an admin and isAdmin is provided in the request body
        ...(loggedInCustomer.isAdmin && {
          isAdmin: isAdmin !== undefined ? isAdmin : loggedInCustomer.isAdmin,
        }),
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

// -- deleting customer by id function (only for admin)
const deleting = async (req, res, next) => {
  try {
    // -- reading id from request
    const id = req.params.id;
    // -- Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new HttpError("Invalid customer ID format", 400));
    }

    // -- getting customerId from session
    const loggedInCustomerId = req.session.customerId;
    // -- searching logged in customer in the DB
    const loggedInCustomer = await Customer.findById(loggedInCustomerId);
    // -- logged in customer is not in the DB or is not admin
    if (!loggedInCustomer || !loggedInCustomer.isAdmin) {
      return next(
        new HttpError("Forbidden: Only admins can delete customers", 403)
      );
    }

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

    // -- getting customerId from session
    const loggedInCustomerId = req.session.customerId;
    // -- searching logged in customer in the DB
    const loggedInCustomer = await Customer.findById(loggedInCustomerId);
    // -- logged in customer is not in the DB
    if (!loggedInCustomer) {
      return next(new HttpError("Logged-in customer not found", 401));
    }

    // Check if the user is admin or requesting their own data
    if (!loggedInCustomer.isAdmin && loggedInCustomerId.toString() !== id) {
      return next(
        new HttpError(
          "Forbidden: You can only access your own information",
          403
        )
      );
    }

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
