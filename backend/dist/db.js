const mongoose = require("mongoose");
require("dotenv").config();

// -- DB connector
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI,
      { serverSelectionTimeoutMS: 5000 } // every db operation timeout 5sec
      // {dbName: db}
    );
    console.log("MongoDB connected succesfully");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return false;
  }
};

// -- DB connection close
const closeDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};

module.exports = { connectDB, closeDB };
