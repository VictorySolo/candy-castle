const Product = require('../models/product')
const Review = require('../models/review');
const Category = require('../models/category')
const HttpError = require('../services/HttpError')


//GET - get all products 
const gettingAll = async (req, res, next) => {
    try {
        const products = await Product.find()
        if (!products || products.length === 0) {
            return next(new HttpError("No products found", 404))
        }
        res.status(200).json(products);
    } catch (err) {
        next(err)
    }
};

// GET - Get all products by category 
const allProductsByCategory = async (req, res, next) => {
    try {
        const categoryName = req.params.name; // Get category name from URL parameters

        // Find the category by name
        const category = await Category.findOne({ name: categoryName })

        if (!category) {
            return next(new HttpError("Category not found", 404))
        }
        // Find products that belong to the found category
        const products = await Product.find({ category: category._id }).select('name description price')

        res.status(200).json(products);
    } catch (err) {
        next(err)
    }
}

// POST - Create a new product
const createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            composition,
            weight,
            energy,
            category,
            availability,
            amount,
            price
        } = req.body

        if (!name || !description || !composition || !weight || !energy || !category || !availability || !amount || !price) {
            return next(new HttpError("Not enough data for creating a product", 400))
        }
        //Create a new product in database
        const product = await Product.create({
            name,
            description,
            composition,
            weight,
            energy,
            category,
            availability,
            amount,
            price
        })
        if (!product) {
            return next(
                new HttpError("A problem occured while creating a product", 500)
            )
        }
        res.status(201).json(product);
    } catch (err) {
        next(err)
    }
};

//GET - get product by ID
const getProductById = async (req, res, next) => {
    try {
        const id = req.params.id
        const product = await Product.findById(id).populate('category');

        if (!product) {
            return next(new HttpError("Couldn't find the product", 404))
        }
        res.status(200).json(product);
    } catch (err) {
        next(err)
    }
};

// PUT - update product by ID
const updateProduct = async (req, res, next) => {
    try {
        const id = req.params.id
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true, // Return the updated product
            runValidators: true // Ensure the data is valid according to the schema
        })

        if (!updatedProduct) {
            return next(new HttpError("Product was not found", 404))
        }
        res.status(200).json("Updated successfully")
    } catch (err) {
        next(err)
    }
};

// DELETE - remove product by ID
const deleteProductById = async (req, res, next) => {
    try {
        const id = req.params.id
        //Delete the productn by id from database
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return next(new HttpError("Product ID not found", 404))
        }
        res.status(200).json('Product deleted successfully');
    } catch (err) {
        next(err)
    }
};

//GET - get all reviews by product ID 
const allReviews = async (req, res, next) => {
    try {
        const id = req.params.id; // Get product ID or name from URL parameters

        const product = await Product.findById(id)

        if (!product) {
            return next(new HttpError("No products found", 404))
        }

        // Find all reviews for the specified product
        const reviews = await Review.find({ product: product._id })
            .populate({
                path: 'customer',
                select: '_id firstName lastName'
            })

        if (!reviews || reviews.length === 0) {
            return next(new HttpError("No reviews found for this product", 404));
        }

        res.status(200).json(reviews);
    } catch (err) {
        next(err)
    }
};

module.exports = {
    gettingAll,
    allProductsByCategory,
    createProduct,
    getProductById,
    updateProduct,
    deleteProductById,
    allReviews
}