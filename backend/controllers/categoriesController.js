// -- import models
const Customer = require("../models/customer");
const Category = require("../models/category");
const Product = require("../models/product");
const HttpError = require("../services/HttpError");

//GET - get all categories with related products
const gettingAll = async (req, res, next) => {
  try {
    const categories = await Category.find();
    if (!categories || categories.length === 0) {
      return next(new HttpError("No category found", 404));
    }
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

// POST - Create a new category (for admin only)
const createCategory = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;

    // -- checking if the user is logged in and is an admin
    const customer = await Customer.findById(customerId);
    if (!customer || !customer.isAdmin) {
      return next(
        new HttpError("Forbidden: Only admins can create categories", 403)
      );
    }

    const { name, description } = req.body;

    if (!name || !description) {
      return next(new HttpError("Not enough data for creating category", 400));
    }
    const category = await Category.create({
      name,
      description,
    });
    if (!category) {
      return next(
        new HttpError("A problem occured while creating a category", 500)
      );
    }
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

//GET - get a single category by Id and related products
const getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id).populate("products");
    if (!category) {
      return next(new HttpError("Couldn't find the category", 404));
    }
    res.status(200).json(category);
  } catch (err) {
    next(err);
  }
};

// Update a category by ID (for admin only)
const updateCategory = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;

    // -- checking if the user is logged in and is an admin
    const customer = await Customer.findById(customerId);
    if (!customer || !customer.isAdmin) {
      return next(
        new HttpError("Forbidden: Only admins can update categories", 403)
      );
    }
    const id = req.params.id;
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return next(new HttpError("Category not found", 404));
    }
    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (err) {
    next(err);
  }
};

// DELETE - delete category by ID and remove the association from products (for admin only)
const deleteCategoryById = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;

    // -- checking if the user is logged in and is an admin
    const customer = await Customer.findById(customerId);
    if (!customer || !customer.isAdmin) {
      return next(
        new HttpError("Forbidden: Only admins can delete categories", 403)
      );
    }

    const id = req.params.id;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return next(new HttpError("Couldn't find the category", 404));
    }
    // Remove category reference from all related products
    await Product.updateMany(
      { category: category._id },
      { $unset: { categoryId: "" } }
    );
    res
      .status(200)
      .json({ message: "Category and associations deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// POST - Add a category to a product (for admin only)
const addCategoryToProduct = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;

    // -- checking if the user is logged in and is an admin
    const customer = await Customer.findById(customerId);
    if (!customer || !customer.isAdmin) {
      return next(
        new HttpError("Forbidden: Only admins can delete categories", 403)
      );
    }

    const { categoryId, productId } = req.body;

    // Check if both IDs are provided
    if (!categoryId || !productId) {
      return next(
        new HttpError("Both categoryId and productId are required", 400)
      );
    }

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Find the product by ID and update the category field
    const product = await Product.findByIdAndUpdate(
      productId,
      { category: categoryId }, //Link product to category
      {
        new: true,
        runValidators: true,
      }
    );
    if (!product) {
      return next(new HttpError("Product not found", 404));
    }

    // If productId is not in the category's products array, add it
    if (!category.products.includes(productId)) {
      category.products.push(productId);
      await category.save(); // Save updated category with new product reference
    }

    res.status(200).json({
      message: "Product linked to category successfully",
      product,
      category,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  gettingAll,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategoryById,
  addCategoryToProduct,
};
