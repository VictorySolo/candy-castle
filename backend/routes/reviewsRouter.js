// -- importing modules
const express = require("express");
const router = express.Router();

// -- importing functions from reviewsController
const { getReviews } = require("../controllers/reviewsController");

// -- setting up routes for reviews
router.route("/").get(getReviews);

// -- exporting routes
module.exports = router;
