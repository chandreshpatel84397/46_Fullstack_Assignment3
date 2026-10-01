const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        default: 10
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
