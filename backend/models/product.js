const mongoose = require('mongoose')
const { Schema } = mongoose

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"]
    },
    description:{
        type: String,
        required: [true, "Product description is required"]
    },
    composition:{
        type: String,
        required: [true, "Product composition is required"]
    },
    weight:{
        type: Number,
        required: [true, "Product weight is required"]
    },
    energy:{
        type: Number,
        required: [true, "Product energy is required"]
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: "Category", 
        required: [true, "Product category is required"]
    },
    availability:{
        type: Boolean,
        required: [true, "Product availability is required"]
    },
    amount:{
        type: Number,
        required: [true, "Product amount is required"]
    },
    price:{
        type: Number,
        required: [true, "Product price is required"]
    },
    
})

const Product = mongoose.model("Product", productSchema);
module.exports = Product