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
  transferCartToDB,
} = require("../controllers/cartController");

// -- setting up routers for cart
router
  .route("/")
  .get(getCartItems)
  .post(addItemToCart)
  .put(updateItemAmount)
  .delete(deleteItemFromCart);
router
  .route("/extra")
  .get(calculateTotalPrice)
  .post(decreaseItemAmountInCart)
  .put(resetCart);
router.route("/transfer").post(transferCartToDB);
// -- exporting routes
module.exports = router;
