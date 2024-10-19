const mongoose = require('mongoose')

//  DB connector
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected succesfully")
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

// DB connaction close
const closeDB = async () => {
  await mongoose.connection.close()
  console.log("MongoDB connection closed")
}

module.exports = connectDB