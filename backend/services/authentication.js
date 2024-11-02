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


// -- setting secret key from .env
const secretKey = process.env.SECRET_KEY;

// -- creating a token function
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
    if (!bcrypt.compare(password, customer.password)) {
      return next(new HttpError("Password is incorrect", 404));
    }
    // -- creating a cookie "token" with customerId value
    const token = jwt.sign({ _id: customer._id}, secretKey);
    res.cookie("Ticket", token);
    // -- sending response to the client with success login message
    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    console.log("Error creating token (createToken)");
    // -- handling the error
    next(err);
  }
};

// -- checking if client has a token function
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

module.exports = { createToken, checkToken };
