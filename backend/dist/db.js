const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/dist/.env" });

//  DB connector
const connectDB = async (db) => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      { serverSelectionTimeoutMS: 5000 }, // every db operation timeout 5sec
      { dbName: db }
    );
    console.log("MongoDB connected succesfully");
    // -- return true if the DB is connected
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // -- return false if there is a problem with the db
    return false;
  }
};

// -- DB connection close
const closeDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};

module.exports = { connectDB, closeDB };
