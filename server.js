// -- import modules
const express = require("express");
const http = require("http");
require("dotenv").config({ path: "./backend/dist/.env" });
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
// const bcrypt = require("bcrypt");

// -- import modules from my files
const inputTestData = require("./backend/services/inputTestData"); // import filling the DB function
const { connectDB } = require("./backend/dist/db"); // Import the connectDB function

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

// - for routers
const categoriesRouter = require("./backend/routes/categoriesRouter");
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
