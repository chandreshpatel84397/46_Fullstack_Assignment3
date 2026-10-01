// ============================================================
// Question 8: Student CRUD using Sequelize, Express & React
// ============================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, Student, calculateGrade } = require('./models/Student');

const app = express();
const PORT = 3008;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built React client if exists
const clientDist = path.join(__dirname, 'client/dist');
app.use(express.static(clientDist));

// Initialize Database & Seed default students
async function initDb() {
    try {
        await sequelize.sync();
        console.log('>>> SQLite Database synced successfully via Sequelize ORM.');

        const count = await Student.count();
        if (count === 0) {
            console.log('>>> Seeding initial student records...');
            await Student.bulkCreate([
                { rollNo: 'CS-101', name: 'Aarav Mehta', email: 'aarav.mehta@college.edu', course: 'Computer Science', marks: 88.5, grade: 'A+' },
                { rollNo: 'IT-102', name: 'Priya Sharma', email: 'priya.sharma@college.edu', course: 'Information Technology', marks: 92.0, grade: 'A+' },
                { rollNo: 'DS-103', name: 'Rohan Verma', email: 'rohan.verma@college.edu', course: 'Data Science', marks: 68.0, grade: 'B' }
            ]);
            console.log('>>> Sample students seeded.');
        }
    } catch (err) {
        console.error('Error connecting to database:', err);
    }
}
initDb();

// ============================================================
// CRUD API ENDPOINTS (Sequelize)
// ============================================================

// 1. READ: Get all students
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.findAll({ order: [['id', 'DESC']] });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch students: ' + err.message });
    }
});

// 2. READ: Get single student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found.' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. CREATE: Add new student
app.post('/api/students', async (req, res) => {
    try {
        const { rollNo, name, email, course, marks } = req.body;

        if (!rollNo || !name || !email || !course || marks === undefined) {
            return res.status(400).json({ error: 'All fields (Roll No, Name, Email, Course, Marks) are required.' });
        }

        // Check if Roll No already exists
        const existing = await Student.findOne({ where: { rollNo } });
        if (existing) {
            return res.status(400).json({ error: `Student with Roll No ${rollNo} already exists!` });
        }

        const student = await Student.create({
            rollNo,
            name,
            email,
            course,
            marks: parseFloat(marks),
            grade: calculateGrade(marks)
        });

        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: 'Error creating student: ' + err.message });
    }
});

// 4. UPDATE: Update existing student
app.put('/api/students/:id', async (req, res) => {
    try {
        const { rollNo, name, email, course, marks } = req.body;
        const student = await Student.findByPk(req.params.id);

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        student.rollNo = rollNo;
        student.name = name;
        student.email = email;
        student.course = course;
        student.marks = parseFloat(marks);
        student.grade = calculateGrade(marks);

        await student.save();
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: 'Error updating student: ' + err.message });
    }
});

// 5. DELETE: Delete student
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        await student.destroy();
        res.json({ message: `Student ${student.name} deleted successfully.` });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting student: ' + err.message });
    }
});

// Fallback SPA routing
app.get('*', (req, res) => {
    const indexPath = path.join(clientDist, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.send('API running on port ' + PORT + '. Build client with `npm run build:client`');
        }
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Question 8 Server running at http://localhost:${PORT}`);
});
