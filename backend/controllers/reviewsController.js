// -- import DB models
const Review = require("../models/review");
// -- importing modules
const HttpError = require("../services/HttpError");

// -- get reviews for a specific product
const getReviews = async (req, res, next) => {
  try {
    // -- getting productId from query parameters
    const productId = req.query.productId;
    // -- checking if productId parameter exists
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    // -- finding reviews for the specified product
    const reviews = await Review.find({ product: productId });
    // -- always return an array (could be empty if no reviews found)
    res.status(200).json(reviews);
  } catch (error) {
    console.log("Error fetching reviews (getReviews)");
    // -- handling the error
    next(error);
  }
};

// -- creating a new review function
const createReview = async (req, res, next) => {
  try {
    // -- getting parameters from the request
    const { productId, comment, rating } = req.body;
    const customerId = req.session.customerId;

    // -- checking if all the required data exists
    if (!productId || !comment || !rating) {
      return next(new HttpError("Not enough data for creating a review", 400));
    }

    // -- check if the customer already has a review for this product
    const existingReview = await Review.findOne({
      product: productId,
      customer: customerId,
    });

    if (existingReview) {
      // -- update the existing review
      existingReview.comment = comment;
      existingReview.rating = rating;
      await existingReview.save();

      return res.status(200).json({
        message: "Review updated successfully",
        review: existingReview,
      });
    }

    // -- creating new review in the database
    const newReview = await Review.create({
      product: productId,
      comment,
      rating,
      customer: customerId,
    });

    if (!newReview) {
      return next(
        new HttpError("A problem occurred while creating a review", 500)
      );
    }

    // -- returning created review
    res
      .status(200)
      .json({ message: "Review created successfully", review: newReview });
  } catch (err) {
    console.log("Error creating a review (createReview)");
    // -- handling the error
    next(err);
  }
};

// -- updating a review function
const updateReview = async (req, res, next) => {
  try {
    // -- getting parameters from the request
    const { productId, comment, rating } = req.body;
    const customerId = req.session.customerId;

    // -- checking if all the required data exists
    if (!productId || !comment || !rating) {
      return next(new HttpError("Not enough data for updating a review", 400));
    }

    // -- finding the review in the database
    const review = await Review.findOne({
      product: productId,
      customer: customerId,
    });

    if (!review) {
      return next(new HttpError("Review was not found in the DB", 404));
    }

    // -- updating the review fields
    review.comment = comment;
    review.rating = rating;
    await review.save();

    // -- returning updated review
    res.status(200).json({ message: "Review updated successfully", review });
  } catch (err) {
    console.log("Error updating a review (updateReview)");
    // -- handling the error
    next(err);
  }
};

// -- exporting all functions
module.exports = {
  getReviews,
  createReview,
  updateReview,
};
