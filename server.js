// -- import modules
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const http = require("http");
require("dotenv").config({ path: "./backend/dist/.env" });
const cors = require("cors");
const helmet = require("helmet");

// -- importing authentication functions
const {
  login,
  isLoggedIn,
  isLoggedInMiddleware,
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
const reviewsRouter = require("./backend/routes/reviewsRouter");
// -- middleware
const app = express();
app.use(cookieParser());
// -- using the built-in body parser middleware
app.use(express.json());
app.use(express.static("./frontend"));
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
    secret: process.env.SESSION_SECRET, // Change this to a secure secret
    resave: false,
    saveUninitialized: false, // Ensure session is not saved until modified
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if you're using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);
// -- login
app.post("/login", login);
// -- creating a new customer
app.post("/customers", creating);
// -- log off
app.get("/logout", logout);
// -- check if logged in
app.get("/isLoggedIn", isLoggedIn);
// -- product list for unlogined user
app.use("/products", productsRouter);
app.use("/cart", cartRouter);
app.use("/reviews", reviewsRouter);
// -- routes
app.use("/categories", isLoggedInMiddleware, categoriesRouter);
app.use("/customers", isLoggedInMiddleware, customersRouter);

app.use("/orders", isLoggedInMiddleware, ordersRouter);

// -- handling 404 errors
app.use((req, res, next) => {
  res.status(404).json({
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
