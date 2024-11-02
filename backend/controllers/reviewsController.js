// -- import DB models
const Review = require("../models/review");

// -- get reviews for a specific product
const getReviews = async (req, res, next) => {
  try {
    // -- getting productId from query parameters
    const productId = req.query.productId
    // -- checking if productId parameter exists
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    // -- finding reviews for the specified product
    const reviews = await Review.find({ product: productId });
    // -- if no reviews are found send a message to the client
    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "No reviews found for this product" });
    }
    // -- OK response to the client with reviews data
    res.status(200).json(reviews);
  } catch (error) {
    console.log("Error fetching reviews (getReviews)");
    // -- handling the error
    next(error);
  }
};

// -- exporting all functions
module.exports = {
  getReviews,
};
