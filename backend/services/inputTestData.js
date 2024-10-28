// -- import modules
const mongoose = require("mongoose");
// -- adding bcrypt for password hashing
const bcrypt = require("bcrypt");
// -- dotenv for environment variables import
require("dotenv").config({ path: "./backend/dist/.env" });
// -- bcrypt salt rounds for password hashing
const saltRounds = parseInt(process.env.SALT_ROUNDS);

// - import DB modules
const Category = require("../models/category");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Order = require("../models/order");
const Review = require("../models/review");

// -- getting a randome date fo the last 3 months to add to each test order
const getRandomDateInLast3Months = async () => {
  const now = new Date();
  const pastDate = new Date(now.setMonth(now.getMonth() - 3));
  return new Date(
    pastDate.getTime() + Math.random() * (Date.now() - pastDate.getTime())
  );
};

// -- automatic inputing test data to the DB
const inputTestData = async () => {
  // -- creating an array of customers according to customerSchema
  const customers = [
    {
      firstName: "John",
      lastName: "Smith",
      age: 21,
      phone: "0557771122",
      email: "john@ma.il",
      deliveryAddress: "Mapple drv, 1, MyCity, 34-991, 0557771122",
      password: "!qweQWE1",
    },
    {
      firstName: "Paul",
      lastName: "Johnson",
      age: 25,
      phone: "0556662233",
      email: "paul@ma.il",
      deliveryAddress: "Elm str., 12, MegaCity, 35-046, 0556662233",
      password: "!asdASD1",
    },
    {
      firstName: "Anna",
      lastName: "Stone",
      age: 20,
      phone: "0505554422",
      email: "anna@ma.il",
      deliveryAddress: "Royal str., 45, MegaCity, 33-192, 0505554422",
      password: "!zxcZXC1",
    },
    {
      firstName: "Sarah",
      lastName: "Connor",
      age: 45,
      phone: "0547884455",
      email: "sarah@ma.il",
      deliveryAddress: "Valerio str., 15, Smallville, 41-212, 0547884455",
      password: "!asdASD1",
    },
    {
      firstName: "Tony",
      lastName: "Stark",
      age: 38,
      phone: "0555312565",
      email: "tony@ma.il",
      deliveryAddress: "Oceanview drv., 33, Geektown, 12-126, 0555312565",
      password: "!qweQWE1",
    },
  ];

  try {
    // -- saving test customers to the DB
    for (const customer of customers) {
      customer.password = await bcrypt.hash(customer.password, saltRounds);
      const newCustomer = new Customer(customer);
      await newCustomer.save();
    }
    console.log("Test customers inserted successfully");
  } catch (err) {
    console.error("Error inserting test customers: ", err.message);
  }

  // -- creating test categories and products
  try {
    // -- creating an array of categories according to categorySchema
    const categories = [
      {
        name: "Cakes",
        description: "Delicious and decorative cakes for all occasions.",
      },
      {
        name: "Cookies",
        description: "Crispy and chewy cookies in various flavors.",
      },
      {
        name: "Chocolates",
        description: "Rich, creamy, and assorted chocolates.",
      },
      { name: "Candy", description: "Sweet and colorful candy delights." },
      { name: "Pastries", description: "Flaky and tasty pastries." },
    ];

    const savedCategories = [];
    for (const category of categories) {
      // -- saving test categories to the DB
      const savedCategory = await new Category(category).save();
      // -- saving categories to an array to make referencecs with products
      savedCategories.push(savedCategory);
    }
    // -- creating and array of products according to productSchema with "category" field added to make references
    const products = [
      {
        name: "Chocolate Cake",
        description: "Rich chocolate flavor cake",
        composition: "Flour, Sugar, Cocoa, Eggs, Butter",
        weight: 1000,
        energy: 2500,
        availability: true,
        amount: 20,
        price: 50,
        category: "Cakes",
      },
      {
        name: "Vanilla Cake",
        description: "Classic vanilla flavor cake",
        composition: "Flour, Sugar, Eggs, Butter, Vanilla Extract",
        weight: 900,
        energy: 2200,
        availability: true,
        amount: 15,
        price: 45,
        category: "Cakes",
      },
      {
        name: "Red Velvet Cake",
        description: "Moist red velvet cake with cream cheese frosting",
        composition: "Flour, Sugar, Cocoa, Eggs, Butter, Cream Cheese",
        weight: 1200,
        energy: 2700,
        availability: true,
        amount: 10,
        price: 60,
        category: "Cakes",
      },
      {
        name: "Chocolate Chip Cookies",
        description: "Crispy cookies with chocolate chips",
        composition: "Flour, Sugar, Butter, Chocolate Chips",
        weight: 200,
        energy: 800,
        availability: true,
        amount: 100,
        price: 10,
        category: "Cookies",
      },
      {
        name: "Oatmeal Raisin Cookies",
        description: "Healthy oatmeal cookies with raisins",
        composition: "Flour, Oats, Sugar, Butter, Raisins",
        weight: 200,
        energy: 850,
        availability: true,
        amount: 80,
        price: 12,
        category: "Cookies",
      },
      {
        name: "Dark Chocolate",
        description: "High-quality dark chocolate",
        composition: "Cocoa, Sugar, Cocoa Butter",
        weight: 100,
        energy: 600,
        availability: true,
        amount: 50,
        price: 20,
        category: "Chocolates",
      },
      {
        name: "Milk Chocolate",
        description: "Smooth and creamy milk chocolate",
        composition: "Milk, Sugar, Cocoa, Cocoa Butter",
        weight: 100,
        energy: 550,
        availability: true,
        amount: 70,
        price: 18,
        category: "Chocolates",
      },
      {
        name: "Candy Canes",
        description: "Sweet and minty candy canes",
        composition: "Sugar, Corn Syrup, Peppermint Flavor",
        weight: 50,
        energy: 200,
        availability: true,
        amount: 150,
        price: 5,
        category: "Candy",
      },
      {
        name: "Gummy Bears",
        description: "Soft and chewy gummy bears",
        composition: "Sugar, Corn Syrup, Gelatin",
        weight: 100,
        energy: 350,
        availability: true,
        amount: 200,
        price: 8,
        category: "Candy",
      },
      {
        name: "Apple Pastries",
        description: "Flaky pastries filled with apple",
        composition: "Flour, Butter, Sugar, Apple",
        weight: 150,
        energy: 450,
        availability: true,
        amount: 40,
        price: 15,
        category: "Pastries",
      },
      {
        name: "Brownies",
        description: "Chocolatey and fudgy brownies",
        composition: "Flour, Sugar, Cocoa, Eggs, Butter",
        weight: 250,
        energy: 950,
        availability: true,
        amount: 60,
        price: 12,
        category: "Pastries",
      },
      {
        name: "Macarons",
        description: "French almond macarons",
        composition: "Almond Flour, Sugar, Egg Whites, Food Coloring",
        weight: 20,
        energy: 100,
        availability: true,
        amount: 80,
        price: 15,
        category: "Pastries",
      },
      {
        name: "Truffles",
        description: "Decadent chocolate truffles",
        composition: "Cocoa, Cream, Sugar, Butter",
        weight: 100,
        energy: 450,
        availability: true,
        amount: 100,
        price: 25,
        category: "Chocolates",
      },
      {
        name: "Lollipops",
        description: "Colorful and flavorful lollipops",
        composition: "Sugar, Corn Syrup, Flavorings, Food Coloring",
        weight: 30,
        energy: 120,
        availability: true,
        amount: 300,
        price: 3,
        category: "Candy",
      },
      {
        name: "Eclairs",
        description: "Cream-filled eclairs",
        composition: "Flour, Butter, Eggs, Cream, Sugar",
        weight: 180,
        energy: 500,
        availability: true,
        amount: 50,
        price: 20,
        category: "Pastries",
      },
      {
        name: "Fruit Tarts",
        description: "Fresh fruit tarts with custard",
        composition: "Flour, Butter, Eggs, Sugar, Fresh Fruit, Custard",
        weight: 150,
        energy: 450,
        availability: true,
        amount: 35,
        price: 25,
        category: "Pastries",
      },
      {
        name: "Cupcakes",
        description: "Small and sweet cupcakes",
        composition: "Flour, Sugar, Butter, Eggs, Frosting",
        weight: 100,
        energy: 400,
        availability: true,
        amount: 80,
        price: 10,
        category: "Pastries",
      },
      {
        name: "Marshmallows",
        description: "Soft and fluffy marshmallows",
        composition: "Sugar, Corn Syrup, Gelatin",
        weight: 100,
        energy: 300,
        availability: true,
        amount: 120,
        price: 8,
        category: "Candy",
      },
      {
        name: "Butter Cookies",
        description: "Rich and buttery cookies",
        composition: "Flour, Butter, Sugar, Eggs",
        weight: 200,
        energy: 700,
        availability: true,
        amount: 90,
        price: 12,
        category: "Cookies",
      },
      {
        name: "Baklava",
        description: "Sweet and nutty baklava",
        composition: "Phyllo Dough, Nuts, Honey, Sugar",
        weight: 150,
        energy: 600,
        availability: true,
        amount: 70,
        price: 30,
        category: "Pastries",
      },
    ];

    for (const product of products) {
      // -- assigning a category to each product as an ID from the DB
      const category = savedCategories.find(
        (cat) => cat.name === product.category
      );
      // -- saving each product in the DB with the category reference
      const savedProduct = await new Product({
        ...product,
        category: category._id,
      }).save();
      // -- saving in savedCategories array an ID of each saved product to set references in the DB
      category.products.push(savedProduct._id);
    }

    for (const category of savedCategories) {
      // -- saving in the DB for each category a list of product IDs of this category
      await category.save();
    }

    console.log("Test test categories and products inserted successfully");
  } catch (err) {
    console.error("Error inserting test categories or products:", err.message);
  }

  // -- creating test orders
  try {
    // -- getting all customers and products from the DB
    const customers = await Customer.find();
    const products = await Product.find();

    // -- selecting 4 customers of all the test customers randomly
    const selectedCustomers = customers
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
    // -- declaring an array to collect all the test orders
    const orders = [];
    // -- a loop for creating 10 random orders
    for (let i = 0; i < 10; i++) {
      // -- selecting one of 4 random customers randomly to create an order
      const customer =
        selectedCustomers[Math.floor(Math.random() * selectedCustomers.length)];
      // -- selecting randomly a set of products in the order (3-10)
      const orderProducts = products
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 8) + 3);
      // -- selecting randomly the amount of each of the selected products in current order (1-5)
      const productsWithAmount = orderProducts.map((product) => ({
        product: product._id,
        amount: Math.floor(Math.random() * 5) + 1,
      }));
      // -- calculating the total price of the ordered products
      const totalPrice = productsWithAmount.reduce((acc, item) => {
        const product = products.find((p) => p._id.equals(item.product));
        return acc + product.price * item.amount;
      }, 0);
      // -- creating an order in the DB
      const order = await Order.create({
        date: await getRandomDateInLast3Months(),
        products: productsWithAmount,
        deliveryAddress: customer.deliveryAddress,
        price: totalPrice,
        customer: customer._id,
      });

      // -- saving order ID to the customer as a reference and saving it to the DB
      await Customer.findByIdAndUpdate(customer._id, {
        $push: { orders: order._id },
      });

      // -- saving current order to the array to save in the DB later
      orders.push(order);
    }

    console.log("Test orders inserted successfully");
  } catch (err) {
    console.error("Error inserting test orders:", err.message);
  }

  // -- creating test reviews
  // -- list of comments
  const commentsAndRatings = [
    {
      comment: "This product exceeded my expectations! Absolutely love it.",
      rating: 5,
    },
    { comment: "Quite good. Definitely recommend trying this out.", rating: 4 },
    { comment: "It’s decent, but there’s room for improvement.", rating: 3 },
    { comment: "Not very impressed. Expected more.", rating: 2 },
    { comment: "Really disappointed with this purchase.", rating: 1 },
    {
      comment: "My family couldn’t get enough of this! Will buy again.",
      rating: 5,
    },
    { comment: "Good value for money. Satisfied with the quality.", rating: 4 },
    { comment: "It’s okay, not what I had hoped for.", rating: 3 },
    {
      comment: "Wouldn’t buy this again. Felt like a waste of money.",
      rating: 2,
    },
    { comment: "Terrible quality, do not recommend.", rating: 1 },
    { comment: "Delicious and fresh. Would highly recommend.", rating: 5 },
    { comment: "Pretty tasty, but a bit pricey.", rating: 4 },
    { comment: "Average taste, nothing special.", rating: 3 },
    { comment: "Below average. Did not meet my expectations.", rating: 2 },
    { comment: "Awful taste. Not worth the purchase.", rating: 1 },
  ];
  try {
    // -- getting all customers and products from the DB
    const customers = await Customer.find();
    const products = await Product.find();

    const reviews = [];
    // -- a loop for creating 15 random reviews
    for (let i = 0; i < 15; i++) {
      // -- selecting a random customer
      const customer = customers[Math.floor(Math.random() * customers.length)];
      // -- declaring product variable to change it if the customer already wrote a review
      let product;
      // -- selecting a random product to review while selected customer already has a review for selected product
      do {
        product = products[Math.floor(Math.random() * products.length)];
      } while (
        reviews.some(
          (review) =>
            review.customer.equals(customer._id) &&
            review.products.equals(product._id)
        )
      );
      // -- getting a comment-rating pair from commentsAndRatings array
      const { comment, rating } = commentsAndRatings[i];
      // -- creating review model according to reviewSchema
      const review = new Review({
        date: await getRandomDateInLast3Months(),
        products: product._id, // setting a refference to product
        comment,
        rating,
        customer: customer._id, // setting a refference to customer
      });
      // -- saving a review to the array
      reviews.push(review);
    }
    // -- saving each review to the DB
    for (const review of reviews) {
      await review.save();
    }

    console.log("Test reviews inserted successfully");
  } catch (err) {
    console.error("Error inserting test reviews:", err.message);
  }
};

module.exports = inputTestData;
