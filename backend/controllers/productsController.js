const Product = require('../models/product')
const Review = require('../models/review')

//GET - get all products by category or name
const getAllProducts = async (req, res) => {
    try {
        const { category, name, minPrice, maxPrice } = req.query

        // Build the query object dynamically based on the query params
        const query = {}

        if (category) {
            query.category = category // Filter by category ID
        }

        if (name) {
            query.name = new RegExp(name, 'i')
        }

        // Filter by price range
        if (minPrice && maxPrice) {
            query.price = { $gte: minPrice, $lte: maxPrice }; // Price between minPrice and maxPrice
        } else if (minPrice) {
            query.price = { $gte: minPrice }; // Products with price greater than or equal to minPrice
        } else if (maxPrice) {
            query.price = { $lte: maxPrice }; // Products with price less than or equal to maxPrice
        }

        const products = await Product.find().populate('category'); // Populate category reference
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message })
    }
};

// POST - Create a new product
const createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body); // req.body contains product details
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(400).json({ message: 'Error creating product', error: error.message });
    }
};

//GET - get product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
};

// PUT - update product by ID
const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated product
            runValidators: true // Ensure the data is valid according to the schema
        });

        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error: error.message });
    }
};

// DELETE - remove product by ID
const deleteProductById = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
};

//GET - get all reviews by product ID or name
const getAllReviews = async (req, res) => {
    try {
        const { id, name } = req.params; // Get product ID or name from URL parameters

        let product;

        if (id) {
            product = await Product.findById(id)
        }
        if (name) {
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
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProductById,
    getAllReviews
}