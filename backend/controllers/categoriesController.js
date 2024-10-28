const Category = require('../models/category')
const Product = require('../models/product')
const HttpError = require('../services/HttpError')

//GET - get all gategories with related products
const gettingAll = async (req, res, next) => {
    try {
        const categories = await Category.find().populate('products')
        if (!categories || categories.length === 0) {
            return next(new HttpError("No products found", 404))
        }
        res.status(200).json(categories);
    } catch (err) {
        next(err)
    }
}

// POST - Create a new category
const createCategory = async (req, res, next) => {
    try {
        const newCategory = new Category(req.body)
        await newCategory.save()
        res.status(201).json({ message: 'Category created successfully', category: newCategory })
    } catch (err) {
        next(err)
    }
}

//GET - get a single category by name and related products
const getCategoryByName = async (req, res, next) => {
    try {
        const category = await Category.findOne({ name: req.params.name }).populate('products');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (err) {
        next(err)
    }
};

// Update a category by ID
const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!category) {
            return res.status(404).json({ message: 'Category not found' })
        }
        res.status(200).json({ message: 'Category updated successfully', category })
    } catch (err) {
        next(err)
    }
}

// DELETE - delete category by ID and remove the association from products
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' })
        }
        // Remove category reference from all related products
        await Product.updateMany({ categoryId: category._id }, { $unset: { categoryId: '' } })
        res.status(200).json({ message: 'Category and associations deleted successfully' })
    } catch (err) {
        next(err)
    }
}

// POST - Add a category to a product
const addCategoryToProduct = async (req, res, next) => {
    try {
        const { categoryId, productId } = req.body

        // Find the category by ID
        const category = await Category.findById(categoryId)
        if (!category) {
            return res.status(404).json({ message: 'Category not found' })
        }

        // Link product with category and update the category's products array
        const product = await Product.findByIdAndUpdate(
            productId,
            { category: categoryId },
            {
                new: true,
                runValidators: true
            }
        );
        if (!product) {
            return next(new HttpError("Product not found", 404));
        }

        // Ensure the product ID is unique in category's products list
        if (!category.products.includes(productId)) {
            category.products.push(productId);
            await category.save();
        }

        res.status(200).json({ message: 'Product linked to category successfully', product })
    } catch (err) {
        next(err)
    }
}

module.exports = {
    gettingAll,
    createCategory,
    getCategoryByName,
    updateCategory,
    deleteCategory,
    addCategoryToProduct
}