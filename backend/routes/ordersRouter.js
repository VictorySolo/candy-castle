// -- importing modules
const express = require("express");
const router = express.Router();

// -- importing functions from ordersController
const {
  createNewOrder,
  cancelOrder,
} = require("../controllers/ordersController");

// -- setting up routes for orders
router.route("/").post(createNewOrder).delete(cancelOrder);

// -- exporting routes
module.exports = router;
