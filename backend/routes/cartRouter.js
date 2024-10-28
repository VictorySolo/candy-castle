// -- importing modules
const express = require("express");
const router = express.Router();
// -- importing fuctions from cartController
const {
  addItemToCart,
  decreaseItemAmountInCart,
  getCartItems,
  deleteItemFromCart,
  resetCart,
  calculateTotalPrice,
} = require("../controllers/cartController");

// -- setting up routers for cart
router
  .route("/")
  .get(getCartItems)
  .post(addItemToCart)
  .put(decreaseItemAmountInCart)
  .delete(deleteItemFromCart);
router.route("/:id").get(resetCart);
router.get("/:id/price", calculateTotalPrice);
// -- exporting routes
module.exports = router;
