// -- import modules
const mongoose = require("mongoose");
// -- DB connector
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://mf:PassPass1@cluster0.amheo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      { serverSelectionTimeoutMS: 5000 } // every db operation timeout 5sec
    );
    console.log("The DB connected");
    // res.status(200).json(`The DB connected`);
    return true;
  } catch (error) {
    console.log("Can't connect to the DB");
    // res.status(500).json(`Can't connect to the DB`);
    return false;
  }
};

// -- closing MongoDB connection
const closeDB = async () => {
    await mongoose.connection.close();
    console.log("DB connection closed");
    // res.status(200).json(`DB connection closed`);
  };

module.exports = {connectDB, closeDB}; // export DB connector
