// -- importing modules
const express = require("express");
const router = express.Router();

// -- importing functions from reviewsController
const {
  getReviews,
  createReview,
  updateReview,
} = require("../controllers/reviewsController");

// -- setting up routes for reviews
router.route("/").get(getReviews).post(createReview).put(updateReview);

// -- exporting routes
module.exports = router;
