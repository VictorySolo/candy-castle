// -- importing modules
const express = require("express");
const router = express.Router();

// -- importing functions from ordersController
const {
  createNewOrder,
  cancelOrder,
} = require("../controllers/ordesController");

// -- setting up routes for orders
router.route("/").post(createNewOrder);
router.route("/:id").delete(cancelOrder);

// -- exporting routes
module.exports = router;
