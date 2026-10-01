// ============================================================
// Question 5: Employee Site with JWT Authentication & React Frontend
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const Employee = require('./models/Employee');
const Leave = require('./models/Leave');

const app = express();
const PORT = 3005;
const JWT_SECRET = 'erp-employee-jwt-secret-key-2026';
const MONGO_URI = 'mongodb://127.0.0.1:27017/erp_system';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve built React client if exists
const clientDistPath = path.join(__dirname, 'client/dist');
app.use(express.static(clientDistPath));

// Connect to MongoDB & Seed default employee if none exists
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('>>> Connected to MongoDB (erp_system)');
        // Ensure at least one test employee exists for easy evaluation
        const count = await Employee.countDocuments();
        if (count === 0) {
            const hash = await bcrypt.hash('password123', 10);
            await Employee.create({
                empid: 'EMP1001',
                name: 'John Doe',
                email: 'johndoe@erp.local',
                password: hash,
                department: 'Information Technology',
                designation: 'Software Engineer',
                basicSalary: 60000,
                allowances: 15000,
                deductions: 5000,
                netSalary: 70000
            });
            console.log('>>> Seeded initial test employee: EMP1001 / password123');
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));

// JWT Verification Guard Middleware
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied! No authorization token provided.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token!' });
        }
        req.user = decoded; // { empid, email, name, ... }
        next();
    });
}

// ============================================================
// API ROUTES
// ============================================================

// 1. Employee Login Route with JWT
app.post('/api/login', async (req, res) => {
    try {
        const { empid, password } = req.body;

        if (!empid || !password) {
            return res.status(400).json({ message: 'Employee ID and Password are required!' });
        }

        // Search employee by empid (from Q4 collection)
        const employee = await Employee.findOne({ empid });
        if (!employee) {
            return res.status(401).json({ message: 'Invalid Employee ID or Password!' });
        }

        // Compare encrypted password
        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Employee ID or Password!' });
        }

        // Generate JWT Token (valid for 24 hours)
        const token = jwt.sign(
            { empid: employee.empid, email: employee.email, name: employee.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful!',
            token,
            employee: {
                empid: employee.empid,
                name: employee.name,
                email: employee.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

// 2. Page 1: Display Employee Profile (Protected by JWT)
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const employee = await Employee.findOne({ empid: req.user.empid }).select('-password');
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found!' });
        }
        res.json(employee);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving profile: ' + err.message });
    }
});

// 3. Page 2: Leave Application Endpoints (Protected by JWT)

// Get all leaves applied by logged-in employee (List)
app.get('/api/leaves', verifyToken, async (req, res) => {
    try {
        const leaves = await Leave.find({ empid: req.user.empid }).sort({ appliedAt: -1 });
        res.json(leaves);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving leaves: ' + err.message });
    }
});

// Apply for a new leave (Add)
app.post('/api/leaves', verifyToken, async (req, res) => {
    try {
        const { date, reason } = req.body;
        if (!date || !reason) {
            return res.status(400).json({ message: 'Date and Reason are required.' });
        }

        const newLeave = new Leave({
            empid: req.user.empid,
            employeeName: req.user.name,
            date,
            reason,
            granted: 'Pending' // Initial status
        });

        await newLeave.save();
        res.status(201).json({ message: 'Leave application submitted successfully!', leave: newLeave });
    } catch (err) {
        res.status(500).json({ message: 'Error saving leave application: ' + err.message });
    }
});

// Fallback route for SPA
app.get('*', (req, res) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            res.status(200).send('<h3>API Server is running on port ' + PORT + '. Run `npm run build:client` or `npm --prefix client run dev` to view React UI.</h3>');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Question 5 Server running at http://localhost:${PORT}`);
});
