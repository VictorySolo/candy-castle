const express = require('express');
const router = express.Router();
const {
    gettingAll,
    createProduct,
    getProductById,
    updateProduct,
    deleteProductById,
    allProductsByCategory,
    allReviews
} = require('../controllers/productsController');

router.route("/").get(gettingAll).post(createProduct)
router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProductById)
router.route("/category/:name").get(allProductsByCategory)
// router.route("/reviews/:id").get(allReviews)

module.exports = router;
