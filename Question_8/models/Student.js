const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite (zero-configuration, runs immediately without MySQL server)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'students.sqlite'),
    logging: false
});

// Helper function to compute grade from marks
function calculateGrade(marks) {
    const m = parseFloat(marks);
    if (m >= 85) return 'A+';
    if (m >= 75) return 'A';
    if (m >= 65) return 'B';
    if (m >= 50) return 'C';
    if (m >= 40) return 'D';
    return 'F (Fail)';
}

// Student Model Definition
const Student = sequelize.define('Student', {
    rollNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    course: {
        type: DataTypes.STRING,
        allowNull: false
    },
    marks: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    grade: {
        type: DataTypes.STRING
    }
}, {
    hooks: {
        beforeSave: (student) => {
            student.grade = calculateGrade(student.marks);
        }
    }
});

module.exports = { sequelize, Student, calculateGrade };
