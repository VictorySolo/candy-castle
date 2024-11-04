// -- import DB models
const Product = require("../models/product");
const Cart = require("../models/cart");
// -- import mongoose
const mongoose = require("mongoose");

// -- transfering the cart from the local storage to the DB
const transferCartToDB = async (req, res, next) => {
  try {
    // -- getting parameters from request
    const { cart, customerId } = req.body;
    // -- checking if all necessary parameters exist
    if (!cart || !customerId) {
      return res.status(400).json({ message: "Not enough parameters" });
    }

    // -- getting existing cart object for current customer
    let existingCart = await Cart.findOne({ customerId });
    if (!existingCart) {
      existingCart = new Cart({ customerId, items: [] });
    }

    // -- processing each item in the cart
    for (const item of cart) {
      // -- checking if the item already exists in the cart
      const existingItemIndex = existingCart.items.findIndex(
        (cartItem) => cartItem.productId.toString() === item.productId
      );

      // -- if the item exists, update the amount
      if (existingItemIndex >= 0) {
        existingCart.items[existingItemIndex].amount += item.amount;

        // -- Get the product from the database to check availability
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ message: `Product not found: ${item.productId}` });
        }

        // -- Ensure cart amount does not exceed product amount
        if (existingCart.items[existingItemIndex].amount > product.amount) {
          existingCart.items[existingItemIndex].amount = product.amount;
        }
      } else {
        // -- if the item doesn't exist, add it to the cart
        existingCart.items.push({
          productId: item.productId,
          amount: item.amount,
        });
      }
    }

    // -- saving the cart to the DB
    await existingCart.save();
    return res
      .status(200)
      .json({ status: "success", message: "Cart transferred successfully" });
  } catch (error) {
    console.error("Error transferring cart:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to transfer cart" });
  }
};

// -- adding an item to the cart
const addItemToCart = async (req, res, next) => {
  try {
    // -- getting parameters from request
    const { productId, amount } = req.body;
    // -- getting customerId from session
    const customerId = req.session.customerId;
    // -- checking if all necessary parameters exist
    if (!customerId || !productId || amount === undefined) {
      return res.status(400).json({ message: "Not enough parameters" });
    }
    // -- getting the product details to check the available amount
    const product = await Product.findById(productId);
    // -- checking if product is not found (not nessesary)
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart;
    // -- if customer logged in
    if (customerId) {
      // -- getting existing cart object for current customer
      cart = await Cart.findOne({ customerId });
      if (!cart) {
        cart = new Cart({ customerId, items: [] });
      }
    } else {
      // Use session for guest cart
      cart = req.session.cart || { items: [] };
    }
    // -- checking if the current product is already in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    // -- calculating the total requested amount
    const totalRequestedAmount =
      existingItemIndex >= 0
        ? cart.items[existingItemIndex].amount + amount
        : amount;
    // -- checking if requested amount exceeds available product amount
    if (totalRequestedAmount > product.amount) {
      return res.status(400).json({ message: `Not enough ${product.name}` });
    }
    // -- if the product is int the cart -> add the amount to existing amount od product
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].amount += amount;
    } else {
      // -- else add new product/amount pair to the cart
      cart.items.push({ productId, amount });
    }
    // -- saving the cart to the DB
    await cart.save();
    // -- calculating the total price
    const totalPrice = await cart.calculateTotalPrice();
    // -- formatting the response
    const responseCart = {
      customerId: cart.customerId,
      items: await Promise.all(
        cart.items.map(async (item) => {
          const product = await Product.findById(item.productId);
          return {
            id: product._id,
            name: product.name,
            price: product.price,
            amount: item.amount,
          };
        })
      ),
      totalPrice: totalPrice,
    };
    // -- OK response to the client
    res.status(200).json({ message: "Item added to cart", responseCart });
  } catch (error) {
    console.log("Error adding item to cart (addItemToCart)");
    // -- handling the error
    next(error);
  }
};

// -- decreasing the amount of a product in the cart by 1
const decreaseItemAmountInCart = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;
    // -- getting productId from request
    const { productId } = req.body;
    // -- checking if all necessary parameters are present
    if (!productId) {
      return res.status(400).json({ message: "Not enough parameters" });
    }
    let cart;
    // -- if customer logged in
    if (customerId) {
      // -- getting existing cart object for current customer
      cart = await Cart.findOne({ customerId });
    } else {
      // -- using session for guest cart
      cart = req.session.cart || { items: [] };
    }

    // -- if the cart exists getting the current product from the cart
    if (cart) {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      // -- checking if the product exists in the cart and its amount is greater than 1
      if (existingItemIndex >= 0 && cart.items[existingItemIndex].amount > 1) {
        // -- decreasing the amount of product by 1
        cart.items[existingItemIndex].amount -= 1;
        // --saving the cart to the DB
        await cart.save();
        // -- calculating the total price
        const totalPrice = await cart.calculateTotalPrice();

        // -- formatting the response
        const responseCart = {
          customerId: cart.customerId,
          items: await Promise.all(
            cart.items.map(async (item) => {
              const product = await Product.findById(item.productId);
              return {
                id: product._id,
                name: product.name,
                price: product.price,
                amount: item.amount,
              };
            })
          ),
          totalPrice: totalPrice,
        };
        // -- OK response to the client
        res.status(200).json({
          message: "Item amount decreased in cart",
          cart: responseCart,
        });
      } else {
        // -- the amount can't be less than 1 response to the client
        res.status(400).json({ message: "Item amount cannot be less than 1" });
      }
    } else {
      // -- the cart is empty for this customer response to the client
      res.status(404).json({ message: "Cart is empty" });
    }
  } catch (error) {
    console.log(
      "Error decreasing item amount in cart (decreaseItemAmountInCart)"
    );
    // -- handling the error
    next(error);
  }
};

// -- updating the amount of a product in the cart
const updateItemAmount = async (req, res, next) => {
  try {
    // -- getting parameters from request
    const { productId, amount } = req.body;
    // -- getting customerId from session
    const customerId = req.session.customerId;
    // -- checking if all necessary parameters exist
    if (!customerId || !productId || amount === undefined) {
      return res.status(400).json({ message: "Not enough parameters" });
    }
    // -- getting the product details to check the available amount
    const product = await Product.findById(productId);
    // -- checking if product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // -- checking if the new amount is within the allowed range
    if (amount < 1 || amount > product.amount) {
      return res
        .status(400)
        .json({ message: `Amount must be between 1 and ${product.amount}` });
    }

    // -- updating the amount of the product and getting the updated cart object
    // const cart = await Cart.findOneAndUpdate(
    //   { customerId, "items.productId": productId },
    //   { $set: { "items.$.amount": amount } },
    //   { new: true }
    // ).populate("items.productId");

    let cart;
    // -- if customer logged in
    if (customerId) {
      // -- updating the amount of the product and getting the updated cart object
      cart = await Cart.findOneAndUpdate(
        { customerId, "items.productId": productId },
        { $set: { "items.$.amount": amount } },
        { new: true }
      ).populate("items.productId");
    } else {
      // -- using session for guest cart
      cart = req.session.cart || { items: [] };
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (existingItemIndex === -1) {
        return res.status(404).json({ message: "Product not found in cart" });
      }
      cart.items[existingItemIndex].amount = amount;
      req.session.cart = cart;
    }

    // -- calculating the total price
    const totalPrice = customerId
      ? await cart.calculateTotalPrice()
      : cart.items.reduce(
          (total, item) => total + item.amount * item.productId.price,
          0
        );

    // -- formatting the response
    const responseCart = {
      customerId: cart.customerId,
      items: cart.items.map((item) => ({
        id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        amount: item.amount,
      })),
      totalPrice: totalPrice,
    };

    // -- OK response to the client
    res
      .status(200)
      .json({ message: "Item amount updated in cart", cart: responseCart });
  } catch (error) {
    console.log("Error updating item amount in cart (updateItemAmount)");
    // -- handling the error
    next(error);
  }
};

// -- getting all items in the cart
const getCartItems = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;
    let cart;
    // -- if customer logged in
    if (customerId) {
      // -- getting existing cart object for current customer
      cart = await Cart.findOne({ customerId }).populate("items.productId");
    } else {
      // -- using session for guest cart
      cart = req.session.cart || { items: [] };
    }

    // -- if the cart exists getting sending all the cart items to the client
    if (cart) {
      const filteredItems = cart.items.map((item) => ({
        id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        amount: item.amount,
      }));
      // -- calculating the total price const
      const totalPrice = customerId
        ? await cart.calculateTotalPrice()
        : cart.items.reduce(
            (total, item) => total + item.amount * item.productId.price,
            0
          );

      // -- formatting the response
      const responseCart = {
        customerId: cart.customerId,
        items: filteredItems,
        totalPrice: totalPrice,
      };
      res.status(200).json(responseCart);
    } else {
      // -- the cart is empty response to the client
      res.status(404).json({ message: "Cart is empty" });
    }
  } catch (error) {
    console.log("Error retrieving cart items (getCartItems)");
    // -- handling the error
    next(error);
  }
};

// -- deleting an item from the cart
const deleteItemFromCart = async (req, res, next) => {
  try {
    // -- getting productId from request
    const { productId } = req.body;
    // -- getting customerId from session
    const customerId = req.session.customerId;
    // -- checking if all necessary parameters exist
    if (!customerId || !productId) {
      return res.status(400).json({ message: "Not enough parameters" });
    }
    // -- checking if the product exists
    const product = await Product.findById(productId).catch(() => null);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // -- updating the cart and filtering out the product
    // const cart = await Cart.findOneAndUpdate(
    //   { customerId },
    //   { $pull: { items: { productId } } },
    //   { new: true }
    // ).populate("items.productId");

    let cart;
    // -- if customer logged in
    if (customerId) {
      // -- updating the cart and filtering out the product
      cart = await Cart.findOneAndUpdate(
        { customerId },
        { $pull: { items: { productId } } },
        { new: true }
      ).populate("items.productId");
    } else {
      // -- using session for guest cart
      cart = req.session.cart || { items: [] };
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
      req.session.cart = cart;
    }

    // -- if the cart exists filter all the items without the current product
    if (cart) {
      // -- calculating the total price
      const totalPrice = customerId
        ? await cart.calculateTotalPrice()
        : cart.items.reduce(
            (total, item) => total + item.amount * item.productId.price,
            0
          );

      // -- formatting the response
      const responseCart = {
        customerId: cart.customerId,
        items: cart.items.map((item) => ({
          id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          amount: item.amount,
        })),
        totalPrice: totalPrice,
      };
      // -- OK response to the client
      res
        .status(200)
        .json({ message: "Item removed from cart", cart: responseCart });
    } else {
      // -- the cart is empty for this customer response to the client
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.log("Error removing item from cart (deleteItemFromCart)");
    // -- handling the error
    next(error);
  }
};

// -- reseting the cart
const resetCart = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;

    let cart;
    // -- if customer logged in
    if (customerId) {
      // -- getting existing cart object for current customer
      cart = await Cart.findOne({ customerId });
    } else {
      // -- using session for guest cart
      cart = req.session.cart || { items: [] };
    }

    // -- if the cart exists deleting all the items ftom it
    if (cart) {
      cart.items = [];
      // --saving the cart to the DB
      await cart.save();
      // -- OK response to the client
      res.status(200).json({ message: "Cart reset", cart });
    } else {
      // -- the cart is empty for this customer response to the client
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.log("Error resetting cart (resetCart)");
    // -- handling the error
    next(error);
  }
};

// -- calculating the total price of items in the cart
const calculateTotalPrice = async (req, res, next) => {
  try {
    // -- getting customerId from session
    const customerId = req.session.customerId;
    // -- getting existing cart object for current customer
    const cart = await Cart.findOne({ customerId });
    // -- if the cart exists calculating its total price
    if (cart) {
      // -- calling cartSchema method to calculate
      const totalPrice = await cart.calculateTotalPrice();
      // -- sending the total price to the client as a response
      res.status(200).json({ message: "Total price calculated", totalPrice });
    } else {
      // -- the cart is empty response to the client
      res.status(404).json({ message: "Cart not found" });
    }
  } catch (error) {
    console.log("Error calculating total price (calculateTotalPrice)");
    // -- handling the error
    next(error);
  }
};

// -- exporting all functions
module.exports = {
  addItemToCart,
  decreaseItemAmountInCart,
  getCartItems,
  deleteItemFromCart,
  resetCart,
  updateItemAmount,
  calculateTotalPrice,
  transferCartToDB,
};
