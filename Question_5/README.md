# Question 5: Employee Site with JWT Authentication & React.js

## Objective
Develop an Employee Portal (referring to Q4 database/employees) with:
- Employee login using JWT (JSON Web Tokens).
- Built with Mongoose, Express backend, and React.js frontend.
- Home page with links/tabs:
  - **Page 1**: Display employee profile (Name, ID, Department, Designation, Salary calculation from Q4).
  - **Page 2**: Application for leave (fields: date, reason, grant yes/no/pending) with **Add** form and **List** table.
  - **Logout** functionality (clears JWT).

---

## File Structure
```text
Question_5/
├── package.json          # Backend dependencies & run scripts
├── server.js             # Express API with JWT verification and static frontend serving
├── models/
│   ├── Employee.js       # Employee model (connects to Q4 'erp_system' database)
│   └── Leave.js          # Leave application model (date, reason, granted)
└── client/               # React.js Single Page Application
    ├── package.json      # React dependencies
    ├── vite.config.js    # Vite configuration & backend proxy
    ├── index.html        # HTML entry point
    └── src/
        ├── main.jsx      # React root render
        └── App.jsx       # Auth state, Profile view (Page 1), Leave Application (Page 2)
```

---

## Step-by-Step Code Walkthrough

1. **Shared Database & Authentication (`server.js`)**:
   - Connects to `mongodb://127.0.0.1:27017/erp_system` (shares data with Question 4).
   - If starting fresh, auto-seeds a default employee `EMP1001` (`password123`).
   - Login compares hashed passwords using `bcrypt.compare` and issues a signed JWT token valid for 24 hours.

2. **JWT Guard Middleware (`verifyToken`)**:
   - Inspects the `Authorization: Bearer <token>` header for protected endpoints (`/api/profile`, `/api/leaves`).

3. **React Frontend (`client/src/App.jsx`)**:
   - Manages authentication state in `localStorage`.
   - If not logged in, presents a clean login form with test credentials.
   - **Page 1 (Profile)**: Fetches and displays full employee details (including net salary calculation) in an HTML table.
   - **Page 2 (Leave Application)**:
     - Form to submit date and reason.
     - Table listing all submitted leaves with grant status (`Yes`, `No`, or `Pending`).
   - **Logout**: Clears the JWT from storage and redirects back to login.

---

## How to Install and Run

1. Open terminal and navigate to the `Question_5` folder:
   ```bash
   cd Question_5
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install React client dependencies and build the frontend:
   ```bash
   npm run build:client
   ```

4. Start the Express server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:3005
   ```

6. **Login Credentials**:
   - Employee ID: `EMP1001`
   - Password: `password123`
   *(Or use any employee ID and password created from Question 4 Admin panel!)*

*(Optional for React Live Reload development)*:
```bash
cd client
npm run dev
# Opens at http://localhost:5175
```
