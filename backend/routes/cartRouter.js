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
  updateItemAmount,
  calculateTotalPrice,
} = require("../controllers/cartController");

// -- setting up routers for cart
router
  .route("/")
  .post(addItemToCart)
  .put(updateItemAmount)
  .delete(deleteItemFromCart);
router
  .route("/:id")
  .get(getCartItems)
  .post(decreaseItemAmountInCart)
  .put(resetCart);
router.get("/:id/price", calculateTotalPrice);
// -- exporting routes
module.exports = router;
