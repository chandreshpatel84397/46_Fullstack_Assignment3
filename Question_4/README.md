# Question 4: ERP Admin Panel - Employee CRUD & Salary Calculation

## Objective
Develop an Admin Panel for an ERP system with:
- Admin login with Session authentication.
- CRUD operations for the `employees` collection using Mongoose, Express, and EJS template engine.
- Auto-generation of Employee ID (`empid`) and Password.
- Automatic Salary calculation: `Net Salary = Basic Salary + Allowances - Deductions`.
- Password encryption using `bcrypt`.
- Email notification to the employee upon creation using `nodemailer` (shows test email preview link).
- Admin Logout.

---

## File Structure
```text
Question_4/
├── package.json          # Node dependencies and scripts
├── server.js             # Express server, Mongoose connection, Nodemailer, Routes
├── models/
│   └── Employee.js       # Mongoose Schema with salary calculation hook
└── views/
    ├── login.ejs         # Admin login form
    ├── index.ejs         # Table listing all employees, Net Salary, actions, email link
    ├── new.ejs           # Form to insert employee with auto-generated ID/Password
    └── edit.ejs          # Form to update employee details and recalculate salary
```

---

## Step-by-Step Code Walkthrough

1. **Mongoose Model (`models/Employee.js`)**:
   - Defines schema with: `empid`, `name`, `email`, `password`, `department`, `designation`, `basicSalary`, `allowances`, `deductions`, `netSalary`.
   - Pre-save hook automatically computes `netSalary = basicSalary + allowances - deductions`.

2. **Session Authentication & Protection (`server.js`)**:
   - Admin credentials (`admin` / `admin123`) create an active admin session.
   - `requireAdmin` middleware guards all CRUD operations.

3. **Auto-Generated ID & Password Encryption**:
   - `generateEmpId()` counts current documents and formats IDs as `EMP1001`, `EMP1002`, etc.
   - A random password is generated and securely encrypted with `bcrypt.hash(..., 10)` before insertion.

4. **Email Notification (`nodemailer`)**:
   - When an employee is created, Nodemailer sends an email containing the Employee ID, temporary password, and department details.
   - In development/student environment, Ethereal test account is created automatically, and an email preview link is displayed directly on the screen so you can view the sent email in your browser!

5. **Tabular View (`views/index.ejs`)**:
   - Displays all employees in an HTML table (`<table border="1">`) showing all financial calculations and Edit/Delete links.

---

## How to Install and Run

1. Make sure MongoDB is running on your machine (default port: `27017`).
2. Open terminal and navigate to the `Question_4` folder:
   ```bash
   cd Question_4
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and go to:
   ```text
   http://localhost:3004
   ```

6. **Login with Admin Credentials**:
   - Username: `admin`
   - Password: `admin123`
