const mongoose = require('mongoose')
const { Schema } = mongoose

const categorySchema = new Schema({
   name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true
   },
   description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true
   },
   products: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Product",
   }]
}, { timestamps: true })

const Category = mongoose.model("Category", categorySchema)
module.exports = Category