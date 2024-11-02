// -- import modules
const express = require("express");
const session = require("express-session");
const http = require("http");
require("dotenv").config({ path: "./backend/dist/.env" });
const cors = require("cors");
const helmet = require("helmet");

// -- importing authentication functions
const {
  login,
  isLoggedIn,
  logout,
} = require("./backend/services/authentication");
// -- importing functions from customersController
const { creating } = require("./backend/controllers/customersController");
// -- import modules from my files
const inputTestData = require("./backend/services/inputTestData"); // import filling the DB function
const { connectDB } = require("./backend/dist/db"); // Import the connectDB function
// - import routers
const categoriesRouter = require("./backend/routes/categoriesRouter");
const customersRouter = require("./backend/routes/customersRouter");
const productsRouter = require("./backend/routes/productsRouter");
const ordersRouter = require("./backend/routes/ordersRouter");
const cartRouter = require("./backend/routes/cartRouter");
// -- middleware
const app = express();
// -- using the built-in body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(
  session({
    secret: "your secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);
// -- login
app.post("/login", login);
// -- creating a new customer
app.post("/customers", creating);
// -- log off
app.get("/logout", logout);

// -- routes
app.use("/categories", isLoggedIn, categoriesRouter);
app.use("/customers", isLoggedIn, customersRouter);
app.use("/products", isLoggedIn, productsRouter);
app.use("/orders", isLoggedIn, ordersRouter);
app.use("/cart", isLoggedIn, cartRouter);

// -- handling 404 errors
app.use((req, res, next) => {
  res
    .status(404)
    .json({
      message:
        "The resource you are looking for does not exist. Please check the URL and try again.",
    });
});
// -- global error handler
const { errorLogger } = require("./backend/services/errorHandler");
app.use(errorLogger);

const startServer = async () => {
  // -- Calling connectDB and checking if the DB is connected
  if (await connectDB()) {
    // -- Call the function to input test data
    // await inputTestData();

    // -- setting up PORT
    const PORT = process.env.PORT || 3000;

    // -- starting server listener on PORT
    app.listen(PORT, (err) => {
      if (err) {
        console.error("Error while listening", err.message);
      } else {
        console.log(`Server is running on http://localhost:${PORT}`);
      }
    });
  } else {
    console.log("Can't start the app because the DB is unavailable");
  }
};

startServer();
