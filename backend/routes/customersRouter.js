// -- importing modules
const express = require("express");
const router = express.Router();
// -- importing functions from customersController
const {
  allOrders,
  gettingById,
  gettingAll,
  updating,
  deleting,
  creating,
  getId,
} = require("../controllers/customersController");
// -- importing decodeToken middleware
const { decodeToken } = require("../services/authentication");
// -- setting up routes for customers
router.route("/").get(gettingAll).post(creating);
router.route("/info").get(decodeToken, getId);
router.route("/:id").get(gettingById).put(updating).delete(deleting);
// -- setting up route for getting all orders
router.get("/:id/allorders", allOrders);
// -- exporting routes
module.exports = router;
