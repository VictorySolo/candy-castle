// -- import DB models
const Product = require("../models/product");
const Cart = require("../models/cart");

// Add an item to the cart
const addItemToCart = async (req, res, next) => {
  try {
    // -- getting parameters from request
    const { customerId, productId, amount } = req.body;
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
    // -- checking if requested amount exceeds available product amount
    if (amount > product.amount) {
      return res.status(400).json({ message: `Not enough ${product.name}` });
    }
    // -- getting existing cart object for current customer
    let cart = await Cart.findOne({ customerId });
    // -- creating a new Cart object if the cart for the current customer is empty
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }
    // -- checking if the current product is already in the cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
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
    // -- getting customerId from request
    const customerId = req.params.id;
    // -- getting parameters from request
    const { productId } = req.body;
    // -- checking if all necessary parameters are present
    if (!productId) {
      return res.status(400).json({ message: "Not enough parameters" });
    }
    // -- getting existing cart object for current customer
    const cart = await Cart.findOne({ customerId });
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
    const { customerId, productId, amount } = req.body;
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
    const cart = await Cart.findOneAndUpdate(
      { customerId, "items.productId": productId },
      { $set: { "items.$.amount": amount } },
      { new: true }
    ).populate("items.productId");

    // -- calculating the total price
    const totalPrice = await cart.calculateTotalPrice();

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
    // -- getting customerId from request
    const customerId = req.params.id;
    // -- getting existing cart object for current customer
    const cart = await Cart.findOne({ customerId }).populate("items.productId");
    // -- if the cart exists getting sending all the cart items to the client
    if (cart) {
      const filteredItems = cart.items.map((item) => ({
        id: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        amount: item.amount,
      }));
      // -- calculating the total price const
      totalPrice = await cart.calculateTotalPrice();
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
    // -- getting parameters from request
    const { customerId, productId } = req.body;
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
    const cart = await Cart.findOneAndUpdate(
      { customerId },
      { $pull: { items: { productId } } },
      { new: true }
    ).populate("items.productId");
    // -- if the cart exists filter all the items without the current product
    if (cart) {
      // -- calculating the total price
      const totalPrice = await cart.calculateTotalPrice();
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
    // -- getting customerId from request
    const customerId = req.params.id;
    // -- getting existing cart object for current customer
    const cart = await Cart.findOne({ customerId });
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
    // -- getting customerId from request
    const customerId = req.params.id;
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
};
