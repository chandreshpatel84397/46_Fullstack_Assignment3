const mongoose = require('mongoose');

// Leave Application Schema
// Fields: date, reason, grant yes/no
const leaveSchema = new mongoose.Schema({
    empid: {
        type: String,
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    granted: {
        type: String,
        enum: ['Pending', 'Yes', 'No'],
        default: 'Pending'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Leave', leaveSchema);
