const express = require('express');
const router = express.Router();
const{
    gettingAll,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategoryById,
    addCategoryToProduct
} = require('../controllers/categoriesController')

router.route("/").get(gettingAll).post(createCategory)
router.route("/:id").get(getCategoryById).put(updateCategory).delete(deleteCategoryById)
router.route("/category").post(addCategoryToProduct)



module.exports = router;
