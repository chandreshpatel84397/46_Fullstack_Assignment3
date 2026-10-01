// ============================================================
// Question 4: ERP Admin Panel - Employee CRUD & Salary Calculation
// ============================================================

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');

const Employee = require('./models/Employee');

const app = express();
const PORT = 3004;
const MONGO_URI = 'mongodb://127.0.0.1:27017/erp_system';

// 1. Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('>>> Connected to MongoDB (erp_system)'))
    .catch(err => console.error('MongoDB connection error:', err));

// 2. Setup EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 3. Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup for Admin authentication
app.use(session({
    secret: 'erp-admin-secret-key-999',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));

// Admin Authentication Guard
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.redirect('/login?error=Please login as Admin to continue.');
}

// 4. Nodemailer Transporter Setup
let emailTransporter;
async function setupMailer() {
    try {
        // Create an Ethereal test account (zero configuration required, works anywhere!)
        const testAccount = await nodemailer.createTestAccount();
        emailTransporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('>>> Nodemailer initialized with test account:', testAccount.user);
    } catch (e) {
        console.log('Using fallback mock mailer');
        emailTransporter = {
            sendMail: async (opts) => ({ messageId: 'mock-id-123' })
        };
    }
}
setupMailer();

// Helper to send welcome email with credentials
async function sendWelcomeEmail(employee, rawPassword) {
    if (!emailTransporter) return null;
    try {
        const mailOptions = {
            from: '"ERP Admin System" <admin@erp-system.local>',
            to: employee.email,
            subject: 'Welcome to ERP System - Your Account Details',
            html: `
                <h3>Hello ${employee.name},</h3>
                <p>Your ERP employee account has been created successfully.</p>
                <table border="1" cellpadding="6" style="border-collapse: collapse;">
                    <tr><td><strong>Employee ID:</strong></td><td>${employee.empid}</td></tr>
                    <tr><td><strong>Temporary Password:</strong></td><td>${rawPassword}</td></tr>
                    <tr><td><strong>Department:</strong></td><td>${employee.department}</td></tr>
                    <tr><td><strong>Designation:</strong></td><td>${employee.designation}</td></tr>
                    <tr><td><strong>Net Monthly Salary:</strong></td><td>$${employee.netSalary}</td></tr>
                </table>
                <p>Please log in and update your password.</p>
            `
        };

        const info = await emailTransporter.sendMail(mailOptions);
        const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
        console.log(`[Email Sent] To: ${employee.email} | MessageId: ${info.messageId}`);
        if (previewUrl) {
            console.log(`[Email Preview Link]: ${previewUrl}`);
        }
        return previewUrl;
    } catch (err) {
        console.error('Failed to send email:', err.message);
        return null;
    }
}

// Helper: Auto-generate Employee ID (e.g., EMP1001, EMP1002...)
async function generateEmpId() {
    const count = await Employee.countDocuments();
    return 'EMP' + (1001 + count);
}

// Helper: Auto-generate a readable random password
function generateRandomPassword() {
    return 'Pass@' + Math.floor(1000 + Math.random() * 9000);
}

// ============================================================
// ROUTES
// ============================================================

// Default Route
app.get('/', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/employees');
    }
    res.redirect('/login');
});

// Admin Login Page
app.get('/login', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/employees');
    }
    res.render('login', { error: req.query.error || null });
});

// Process Admin Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded simple admin credentials
    if (username === 'admin' && password === 'admin123') {
        req.session.isAdmin = true;
        req.session.adminUser = username;
        return res.redirect('/employees');
    }
    res.render('login', { error: 'Invalid admin username or password!' });
});

// Admin Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login?error=Logged out successfully.');
    });
});

// ============================================================
// Employee CRUD Operations (Protected with Session)
// ============================================================

// READ: List all employees in a tabular form
app.get('/employees', requireAdmin, async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });
        const flashMessage = req.query.msg || null;
        const emailLink = req.query.emailLink || null;
        res.render('index', { employees, flashMessage, emailLink });
    } catch (err) {
        res.status(500).send('Error fetching employees: ' + err.message);
    }
});

// CREATE: Show Add Employee Form
app.get('/employees/new', requireAdmin, async (req, res) => {
    const suggestedEmpId = await generateEmpId();
    const suggestedPassword = generateRandomPassword();
    res.render('new', { suggestedEmpId, suggestedPassword, error: null });
});

// CREATE: Handle Form Submission
app.post('/employees/new', requireAdmin, async (req, res) => {
    try {
        const { name, email, department, designation, basicSalary, allowances, deductions } = req.body;

        // Auto-generate employee ID and password
        const empid = req.body.empid || await generateEmpId();
        const rawPassword = req.body.password || generateRandomPassword();

        // Check if email already exists
        const existing = await Employee.findOne({ email });
        if (existing) {
            return res.render('new', {
                suggestedEmpId: empid,
                suggestedPassword: rawPassword,
                error: 'An employee with this email already exists!'
            });
        }

        // Encrypt the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

        // Calculate Net Salary: Basic + Allowances - Deductions
        const bSal = Number(basicSalary) || 0;
        const allow = Number(allowances) || 0;
        const deduct = Number(deductions) || 0;
        const netSal = bSal + allow - deduct;

        // Create new employee document
        const newEmployee = new Employee({
            empid,
            name,
            email,
            password: hashedPassword,
            department,
            designation,
            basicSalary: bSal,
            allowances: allow,
            deductions: deduct,
            netSalary: netSal
        });

        await newEmployee.save();

        // Send email with credentials to employee
        const previewUrl = await sendWelcomeEmail(newEmployee, rawPassword);

        let redirectUrl = `/employees?msg=Employee ${newEmployee.name} (${newEmployee.empid}) inserted successfully! Password encrypted with bcrypt.`;
        if (previewUrl) {
            redirectUrl += `&emailLink=${encodeURIComponent(previewUrl)}`;
        }
        res.redirect(redirectUrl);
    } catch (err) {
        res.render('new', {
            suggestedEmpId: req.body.empid || 'EMP1001',
            suggestedPassword: req.body.password || 'Pass@123',
            error: 'Error creating employee: ' + err.message
        });
    }
});

// UPDATE: Show Edit Employee Form
app.get('/employees/edit/:id', requireAdmin, async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.redirect('/employees?msg=Employee not found!');
        res.render('edit', { employee, error: null });
    } catch (err) {
        res.redirect('/employees?msg=Invalid employee ID!');
    }
});

// UPDATE: Handle Edit Submission
app.post('/employees/edit/:id', requireAdmin, async (req, res) => {
    try {
        const { name, department, designation, basicSalary, allowances, deductions } = req.body;

        const bSal = Number(basicSalary) || 0;
        const allow = Number(allowances) || 0;
        const deduct = Number(deductions) || 0;
        const netSal = bSal + allow - deduct;

        await Employee.findByIdAndUpdate(req.params.id, {
            name,
            department,
            designation,
            basicSalary: bSal,
            allowances: allow,
            deductions: deduct,
            netSalary: netSal
        });

        res.redirect('/employees?msg=Employee updated successfully!');
    } catch (err) {
        res.redirect('/employees?msg=Error updating employee: ' + err.message);
    }
});

// DELETE: Remove Employee
app.get('/employees/delete/:id', requireAdmin, async (req, res) => {
    try {
        await Employee.findByIdAndDelete(req.params.id);
        res.redirect('/employees?msg=Employee deleted successfully!');
    } catch (err) {
        res.redirect('/employees?msg=Error deleting employee: ' + err.message);
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Question 4 Server running at http://localhost:${PORT}`);
});
