const Product = require('../models/product')
const Review = require('../models/review');
const Category = require('../models/category')
const HttpError = require('../services/HttpError')


//GET - get all products 
const gettingAll = async (req, res, next) => {
    try {
        const products = await Product.findAll()
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
            return res.status(404).json({ message: 'Category not found' });
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
        const newProduct = new Product(req.body); // req.body contains product details
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
        next(err)
    }
};

//GET - get product by ID
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        next(err)
    }
};

// PUT - update product by ID
const updateProduct = async (req, res, next) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated product
            runValidators: true // Ensure the data is valid according to the schema
        });

        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
        next(err)
    }
};

// DELETE - remove product by ID
const deleteProductById = async (req, res, next) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        next(err)
    }
};

//GET - get all reviews by product ID or name
const allReviews = async (req, res, next) => {
    try {
        const { id, name } = req.params; // Get product ID or name from URL parameters

        let product;

        if (id) {
            product = await Product.findById(id)
        } else if (name) {
            product = await Product.findOne({ name: new RegExp(name, 'i') })
        }

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find all reviews for the specified product
        const reviews = await Review.find({ product: product._id }).populate('product'); // Populate product details if needed

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product' });
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