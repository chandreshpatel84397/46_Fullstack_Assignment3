# Question 3: Express Login Application with Redis Session Store

## Objective
Develop an Express Login application using a Redis-backed session store (`connect-redis`) with:
- Login page
- 2 Protected Routes (`/dashboard` and `/reports`)
- Logout route that destroys session in Redis and clears cookie
- Zero-hassle execution: Connects to a real Redis server (if installed at `localhost:6379`), or falls back to an embedded in-memory Redis mock (`ioredis-mock`) so it runs instantly on any machine without crashes.
- Tech Stack: `express`, `express-session`, `connect-redis`, `ioredis`, `ejs`

---

## File Structure
```text
Question_3/
├── package.json          # Node dependencies and scripts
├── server.js             # Express server with connect-redis session store & auth middleware
└── views/
    ├── login.ejs         # Login form with error messages and demo credentials
    ├── dashboard.ejs     # Protected Route 1: Displays session info & Redis key
    └── reports.ejs       # Protected Route 2: Queries and displays raw JSON data from Redis
```

---

## Step-by-Step Code Walkthrough

1. **Redis Client & Store Setup (`server.js`)**:
   - `const { RedisStore } = require('connect-redis');`
   - An `ioredis` client attempts to connect to `127.0.0.1:6379`. If a live Redis server is running, it connects. If not, it utilizes `ioredis-mock` to provide full Redis key-value functionality without requiring external installation.
   - `RedisStore` is configured with `prefix: 'student_sess:'` and `ttl: 3600`.

2. **Session Configuration**:
   - `express-session` delegates all session read/write operations to the Redis store.
   - Sessions are saved with keys like `student_sess:<session-id>`.

3. **Authentication Middleware (`requireAuth`)**:
   - Inspects `req.session.user`.
   - Protects the 2 private routes from unauthorized access.

4. **Protected Route 1: `/dashboard`**:
   - Displays user details, active cookie session ID, and the exact Redis key stored.
   - Tracks page refresh counter in Redis.

5. **Protected Route 2: `/reports`**:
   - Directly executes `redisClient.get('student_sess:' + req.sessionID)` to inspect and show the raw JSON document stored inside Redis.

6. **Logout Route: `/logout`**:
   - Calls `req.session.destroy()` which executes a `DEL` command on the session key in Redis and clears the client-side session cookie.

---

## How to Install and Run

1. Open terminal and navigate to the `Question_3` folder:
   ```bash
   cd Question_3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3003
   ```

5. **Login with demo credentials**:
   - Username: `redis_admin` | Password: `password123`
   - OR
   - Username: `student` | Password: `password123`
