// -- import modules
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const bcrypt = require("bycript");

const PORT = process.env.PORT || 3000;

// -- middleware
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(helmet());

// - for initit create
// const Categorie = require("./backend/models/categorie");
// const Cutomer = require("./backend/models/customer");
// const Product = require("./backend/models/product");
// const Order = require("./backend/models/order");

// - for routers
const categoriesRouter = require("./backend/routes/categorieRouter");
const customersRouter = require("./backend/routes/customersRouter");
const productsRouter = require("./backend/routes/productsRouter");
const ordersRouter = require("./backend/routes/ordersRouter");
// -- global error handler
const { errorLogger } = require("./backend/services/errorHandler");

// -- routes
app.use("/categories", categoriesRouter);
app.use("/customers", customersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

app.use(errorLogger);

// -- possible automatic entering data
// const enterData = async () => {
//   const customer1 = await Customer.create({
//     name: "Dor",
//     email: "dor@gmail.com",
//     password: "dorb1",
//   });

//   const genre1 = await Genre.create({ genreName: "Fantasy" });

//   const movie1 = await Movie.create({
//     title: "The Hobbit",
//     description: "A journey through Middle Earth.",
//     releaseYear: 2012,
//   });

//   await movie1.addGenre(genre1);

//   await Rental.create({
//     rentalDate: new Date(),
//     CustomerId: customer1.id,
//     MovieId: movie1.id,
//   });

// };

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  // possibly need to add try catch
});
