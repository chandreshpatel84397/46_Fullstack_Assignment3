const mongoose = require('mongoose');

// 2-Level Category Schema
// Level 1: Parent Category (parent is null)
// Level 2: Subcategory (parent refers to parent Category _id)
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        enum: [1, 2],
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
