# Question 2: Express Login Application with File Session Store

## Objective
Develop an Express Login application using a file-based session store (`session-file-store`) with:
- Login page
- 2 Protected Routes (`/dashboard` and `/profile`)
- Logout route that destroys session and clears cookie
- Tech Stack: `express`, `express-session`, `session-file-store`, `ejs`

---

## File Structure
```text
Question_2/
├── package.json          # Node dependencies and scripts
├── server.js             # Express server with session-file-store and auth middleware
├── sessions/             # Automatically created folder containing JSON session files
└── views/
    ├── login.ejs         # Login form with error messages and demo credentials
    ├── dashboard.ejs     # Protected Route 1: Displays session info & visit counter
    └── profile.ejs       # Protected Route 2: Displays user profile & file store path
```

---

## Step-by-Step Code Walkthrough

1. **File Session Store Setup (`server.js`)**:
   - `const FileStore = require('session-file-store')(session);`
   - Inside `session({...})`, `store: new FileStore({ path: './sessions', ttl: 3600 })` directs Express to persist all user sessions as `.json` files inside the local `./sessions/` directory.

2. **Authentication Middleware (`isAuthenticated`)**:
   - Checks if `req.session.user` exists.
   - If user is authenticated, it calls `next()`.
   - If not authenticated, redirects the visitor to `/login` with an informative error message.

3. **Protected Route 1: `/dashboard`**:
   - Accessible only after login.
   - Increments a session counter `req.session.visitCount` to show state persistence across refreshes.
   - Displays user details and active session ID in a formatted table.

4. **Protected Route 2: `/profile`**:
   - Displays the logged-in user's profile and explains how the session is stored in `./sessions/<session-id>.json`.

5. **Logout Route: `/logout`**:
   - Calls `req.session.destroy()` which removes the session file from disk and deletes the session cookie `connect.sid`.

---

## How to Install and Run

1. Open terminal and navigate to the `Question_2` folder:
   ```bash
   cd Question_2
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
   http://localhost:3002
   ```

5. **Login with demo credentials**:
   - Username: `admin` | Password: `password123`
   - OR
   - Username: `student` | Password: `student123`
