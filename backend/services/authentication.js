// -- import modules
const jwt = require("jsonwebtoken");
// -- adding bcrypt for password hashing
const bcrypt = require("bcrypt");
// -- extended Error class import
const HttpError = require("../services/HttpError");
// -- dotenv for environment variables import
require("dotenv").config();
// -- import models
const Customer = require("../models/customer");
const Cart = require("../models/cart");

// -- setting secret key from .env
const secretKey = process.env.SECRET_KEY;

// -- login function
const login = async (req, res, next) => {
  try {
    // -- getting parameters from the request
    const { email, password, cart } = req.body;

    // -- checking if all necessary parameters exist
    if (!email || !password) {
      return next(new HttpError("Not enough data for authentication", 400));
    }

    // -- checking if the customer is in the DB
    const customer = await Customer.findOne({ email });

    // -- if customer was not found in the DB
    if (!customer) {
      return next(new HttpError("Couldn't find customer", 404));
    }

    // -- checking if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
      return next(new HttpError("Password is incorrect", 404));
    }
    // -- creating a session and storing user ID
    req.session.customerId = customer._id;

    // -- transfering the cart from the local storage to the DB
    if (cart && cart.length > 0) {
      let existingCart = await Cart.findOne({ customerId: customer._id });
      if (!existingCart) {
        existingCart = new Cart({ customerId: customer._id, items: [] });
      }

      for (const item of cart) {
        const existingItem = existingCart.items.find((i) =>
          i.productId.equals(item.productId)
        );
        if (existingItem) {
          existingItem.amount += item.amount;
        } else {
          existingCart.items.push(item);
        }
      }

      await existingCart.save();
    }

    // -- sending response to the client with success login message
    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    console.log("Error during login (login)");
    // -- handling the error
    next(err);
  }
};

// -- createToken function (old function)
const createToken = async (req, res, next) => {
  try {
    // -- getting parameters from the request
    const { email, password } = req.body;
    // -- checkong if all the required in customerSchema data exists
    if (!email || !password) {
      return next(new HttpError("Not enough data for authenticate", 400));
    }
    // -- checking if the customer is in the DB
    const customer = await Customer.findOne({
      email,
    });
    // -- if customer was not found in the DB send respond to the client
    if (!customer) {
      return next(new HttpError("Couldn't find customer", 404));
    }
    // -- checking if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, customer.password);
    if (!isPasswordCorrect) {
      return next(new HttpError("Password is incorrect", 404));
    }
    // -- creating a cookie "token" with customerId value
    const token = jwt.sign({ _id: customer._id }, secretKey);
    res.cookie("Ticket", token);
    // -- sending response to the client with success login message
    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    console.log("Error creating token (createToken)");
    // -- handling the error
    next(err);
  }
};
// -- isLoggedIn middleware
const isLoggedIn = (req, res, next) => {
  // -- checking if the customerId is present in the session
  if (req.session.customerId) {
    res.status(200).json({ loggedIn: true });
  } else {
    res.status(200).json({ loggedIn: false });
  }
  // if (req.session.customerId) {
  //   next();
  // } else {
  //   // -- sending response to the client "No token"
  //   next(new HttpError("Unauthorized: Please log in", 401));
  //   // res.status(401).json({ message: "Unauthorized: Please log in" });
  // }
};

// -- checking if client has a token function (old function)
const checkToken = async (req, res, next) => {
  try {
    // -- getting the token from the client's cookies
    const token = req.cookies.Ticket;
    // -- checking if the token exists
    if (token) {
      // -- checking if the token is valid
      jwt.verify(token, secretKey, (err, res) => {
        if (err) {
          // -- handling the error
          next(err);
        } else {
          next();
        }
      });
    } else {
      // -- sending response to the client "No token"
      next(new HttpError("No token provided", 401));
    }
  } catch (err) {
    // -- handling the error
    next(err);
  }
};

// -- isAdmin middleware
const isAdmin = (req, res, next) => {
  // -- checking if the customerId is present in the session
  if (req.session.customerId) {
    // -- search customer by Id
    Customer.findById(req.session.customerId, (err, customer) => {
      // -- if the !customer or error - the customert is not logged in
      if (err || !customer) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
      }
      // -- customer is not admin
      if (!customer.isAdmin) {
        return res.status(403).json({
          message: "Forbidden: You do not have the required permissions",
        });
      }
      // -- customer is admin
      next();
    });
  } else {
    // -- not in the session
    res.status(401).json({ message: "Unauthorized: Please log in" });
  }
};

// -- logoout function
const logout = (req, res, next) => {
  // -- destroying the session
  req.session.destroy((err) => {
    if (err) {
      return next(new HttpError("Error logging out", 500));
    }
    // -- sending response to the client with success logoff message
    res.status(200).json({ message: "Logged out successfully" });
  });
};

// -- isLoggedInMiddleware
const isLoggedInMiddleware = (req, res, next) => {
  // -- checking if the customerId is present in the session
  if (req.session.customerId) {
    next(); // Allow the request to proceed
  } else {
    next(new HttpError("Unauthorized: Please log in", 401));
  }
};

// -- exporting functions
module.exports = { login, isLoggedIn, isLoggedInMiddleware, logout, isAdmin };
