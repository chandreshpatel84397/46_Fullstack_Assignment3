const mongoose = require('mongoose');

// Employee Schema with Mongoose
const employeeSchema = new mongoose.Schema({
    empid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true,
        default: 0
    },
    allowances: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to calculate Net Salary:
// Net Salary = Basic Salary + Allowances - Deductions
employeeSchema.pre('save', function (next) {
    this.netSalary = (Number(this.basicSalary) || 0) + (Number(this.allowances) || 0) - (Number(this.deductions) || 0);
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
