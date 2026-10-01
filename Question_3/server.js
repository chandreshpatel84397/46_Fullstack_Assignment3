// ============================================================
// Question 3: Express Login Application with Redis Session Store
// ============================================================

const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis').default || require('connect-redis');
const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');
const net = require('net');
const path = require('path');

const app = express();
const PORT = 3003;

// 1. Setup EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper function to check if local Redis port (6379) is open
function isRedisRunning(port = 6379, host = '127.0.0.1') {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(400);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host);
    });
}

// Initialize Redis Client (Supports both real Redis and zero-setup Redis-mock)
async function startApp() {
    let redisClient;
    let redisMode = '';

    const liveRedisAvailable = await isRedisRunning(6379, '127.0.0.1');

    if (liveRedisAvailable) {
        try {
            const realRedis = new Redis({
                host: '127.0.0.1',
                port: 6379,
                lazyConnect: false
            });
            realRedis.on('error', (e) => console.error('Redis error:', e.message));
            await realRedis.ping();
            redisClient = realRedis;
            redisMode = 'Live Redis Server (localhost:6379)';
            console.log('>>> Connected to Live Redis Server on 127.0.0.1:6379');
        } catch (err) {
            console.log('>>> Fallback to embedded Redis (ioredis-mock).');
            redisClient = new RedisMock();
            redisMode = 'Embedded In-Memory Redis Mock (Zero setup needed)';
        }
    } else {
        // If Redis server is not running on port 6379, use embedded Redis Mock
        console.log('>>> No local Redis server running on port 6379. Falling back to embedded Redis (ioredis-mock).');
        redisClient = new RedisMock();
        redisMode = 'Embedded In-Memory Redis Mock (Zero setup needed)';
    }

    // 3. Configure Redis Session Store using connect-redis
    const redisStore = new RedisStore({
        client: redisClient,
        prefix: 'student_sess:', // Redis key prefix
        ttl: 3600               // Time to live in seconds (1 hour)
    });

    app.use(session({
        store: redisStore,
        secret: 'redis-super-secret-key-67890',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 3600000, // 1 hour
            httpOnly: true
        }
    }));

    // Predefined test users
    const USERS = [
        { username: 'redis_admin', password: 'password123', fullName: 'Redis Admin User', role: 'Administrator' },
        { username: 'student', password: 'password123', fullName: 'John Doe (Student)', role: 'Student' }
    ];

    // Auth Middleware for Protected Routes
    function requireAuth(req, res, next) {
        if (req.session && req.session.user) {
            return next();
        }
        res.redirect('/login?error=Please login to access protected routes.');
    }

    // 4. Routes

    // Root redirect
    app.get('/', (req, res) => {
        if (req.session && req.session.user) {
            return res.redirect('/dashboard');
        }
        res.redirect('/login');
    });

    // Login Page
    app.get('/login', (req, res) => {
        if (req.session && req.session.user) {
            return res.redirect('/dashboard');
        }
        const error = req.query.error || null;
        res.render('login', { error, redisMode });
    });

    // Handle Login
    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        const matched = USERS.find(u => u.username === username && u.password === password);

        if (matched) {
            req.session.user = {
                username: matched.username,
                fullName: matched.fullName,
                role: matched.role,
                loggedInAt: new Date().toLocaleString()
            };
            req.session.pageViews = 1;
            res.redirect('/dashboard');
        } else {
            res.render('login', { error: 'Invalid username or password!', redisMode });
        }
    });

    // ============================================================
    // Protected Route 1: Dashboard
    // ============================================================
    app.get('/dashboard', requireAuth, (req, res) => {
        req.session.pageViews = (req.session.pageViews || 0) + 1;

        res.render('dashboard', {
            user: req.session.user,
            sessionId: req.sessionID,
            pageViews: req.session.pageViews,
            redisMode: redisMode,
            redisKey: 'student_sess:' + req.sessionID
        });
    });

    // ============================================================
    // Protected Route 2: Server Reports / Session Inspection
    // ============================================================
    app.get('/reports', requireAuth, async (req, res) => {
        // Read raw session value directly from Redis using redisClient.get()
        let rawRedisData = null;
        try {
            rawRedisData = await redisClient.get('student_sess:' + req.sessionID);
        } catch (e) {
            rawRedisData = JSON.stringify(req.session);
        }

        res.render('reports', {
            user: req.session.user,
            sessionId: req.sessionID,
            redisMode: redisMode,
            redisKey: 'student_sess:' + req.sessionID,
            rawRedisData: rawRedisData
        });
    });

    // Logout Route
    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying Redis session:', err);
                return res.redirect('/dashboard');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login?error=You have logged out successfully.');
        });
    });

    // Start listening
    app.listen(PORT, () => {
        console.log(`Question 3 Server running at http://localhost:${PORT}`);
    });
}

startApp().catch(console.error);
