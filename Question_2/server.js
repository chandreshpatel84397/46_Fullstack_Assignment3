// ============================================================
// Question 2: Express Login Application with File Session Store
// ============================================================

const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');

const app = express();
const PORT = 3002;

// 1. Setup EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 3. Configure Express Session with FileStore
// Sessions will be persisted on disk inside the "./sessions" folder
app.use(session({
    store: new FileStore({
        path: path.join(__dirname, 'sessions'), // folder to store session files
        ttl: 3600,                              // time to live: 1 hour (in seconds)
        retries: 0
    }),
    secret: 'my-student-friendly-secret-key-12345',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000, // 1 hour in milliseconds
        httpOnly: true
    }
}));

// Pre-defined dummy users for student testing
const USERS = [
    { username: 'admin', password: 'password123', fullName: 'System Administrator', email: 'admin@example.com', role: 'Admin' },
    { username: 'student', password: 'student123', fullName: 'Alex Student', email: 'student@example.com', role: 'Student' }
];

// Authentication Guard Middleware for Protected Routes
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    // If not logged in, redirect to login page with error message
    res.redirect('/login?error=Please log in first to access that page.');
}

// 4. Routes

// Default redirect to login or dashboard
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// GET: Login Page
app.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    const errorMessage = req.query.error || null;
    res.render('login', { errorMessage });
});

// POST: Process Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const matchedUser = USERS.find(u => u.username === username && u.password === password);

    if (matchedUser) {
        // Save user details into session
        req.session.user = {
            username: matchedUser.username,
            fullName: matchedUser.fullName,
            email: matchedUser.email,
            role: matchedUser.role,
            loginTime: new Date().toLocaleString()
        };
        // Initialize page view counter in session
        req.session.visitCount = 1;

        res.redirect('/dashboard');
    } else {
        res.render('login', { errorMessage: 'Invalid username or password!' });
    }
});

// ============================================================
// Protected Route 1: Dashboard
// ============================================================
app.get('/dashboard', isAuthenticated, (req, res) => {
    req.session.visitCount = (req.session.visitCount || 0) + 1;

    res.render('dashboard', {
        user: req.session.user,
        sessionId: req.sessionID,
        visitCount: req.session.visitCount
    });
});

// ============================================================
// Protected Route 2: Profile / Reports
// ============================================================
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {
        user: req.session.user,
        sessionId: req.sessionID,
        sessionStorePath: path.join(__dirname, 'sessions')
    });
});

// Logout Route: Destroys the session file and clears the cookie
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login?error=Logged out successfully.');
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Question 2 Server running at http://localhost:${PORT}`);
});
