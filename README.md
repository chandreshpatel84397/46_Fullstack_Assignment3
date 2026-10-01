# Full-Stack Web Development Assignment 3

This repository contains complete, student-friendly implementations for all 8 assignment questions. Each question is organized in its own self-contained directory with clean, well-commented code, plain HTML forms/tables (no complex CSS frameworks), full requirement coverage, and an individual walkthrough and run guide.

---

## Quick Navigation & Overview

| Folder | Topic / Question | Tech Stack | Port | Command to Run |
|---|---|---|---|---|
| **[Question_1](./Question_1)** | User Registration with Validations & File Upload/Download | Express, EJS, express-validator, Multer | `3001` | `cd Question_1 && npm start` |
| **[Question_2](./Question_2)** | Express Login with File-based Session Store | Express, EJS, express-session, session-file-store | `3002` | `cd Question_2 && npm start` |
| **[Question_3](./Question_3)** | Express Login with Redis Session Store | Express, EJS, express-session, connect-redis, ioredis | `3003` | `cd Question_3 && npm start` |
| **[Question_4](./Question_4)** | ERP Admin Panel: Employee CRUD, Bcrypt, Salary Calc & Email | Express, Mongoose, EJS, bcryptjs, Nodemailer | `3004` | `cd Question_4 && npm start` |
| **[Question_5](./Question_5)** | Employee Site: JWT Login, Profile & Leave Application | Express, Mongoose, JWT, React.js | `3005` | `cd Question_5 && npm start` |
| **[Question_6](./Question_6)** | Useful Utilities calling Free APIs (Frontend & Backend) | Express, Axios, EJS, Browser fetch | `3006` | `cd Question_6 && npm start` |
| **[Question_7](./Question_7)** | Shopping Cart with 2-Level Categories & Admin/User Sites | MERN Stack (MongoDB, Express, React, Node) | `3007` | `cd Question_7 && npm start` |
| **[Question_8](./Question_8)** | Student Collection CRUD with Sequelize ORM | Express, Sequelize, SQLite3, React.js | `3008` | `cd Question_8 && npm start` |

---

## Prerequisites
- **Node.js**: v18+ or v20+ or v24+
- **MongoDB**: Running locally on default port `27017` (Used by Question 4, Question 5, and Question 7).

---

## Detailed Question Summaries

### Question 1: User Registration with Validations & File Upload/Download
- **Features**:
  - Fields: Username, Email, Password, Confirm Password, Gender (radio), Hobbies (checkboxes), Profile Picture (single file), Other Pictures (multiple files).
  - Validations with `express-validator`: password match, email format, lengths, and file type validation with `multer`.
  - **Sticky form**: On validation failure, keeps previous input values and lists all errors clearly.
  - **Tabular presentation**: On success, displays all data and uploaded images in an HTML table (`<table border="1">`).
  - **Download Route**: Provides a dedicated Express route (`/download/:filename`) with download buttons next to uploaded files.

### Question 2: Express Login with File Session Store
- **Features**:
  - Session management using `session-file-store` which writes sessions directly to `./sessions/*.json` on the disk.
  - Login page with demo credentials (`admin` / `password123`).
  - **2 Protected Routes**:
    1. `/dashboard`: Displays active session data and persistent page visit counter.
    2. `/profile`: Displays user profile and the physical file store path on the server.
  - Logout functionality that deletes the session file and destroys cookie.

### Question 3: Express Login with Redis Session Store
- **Features**:
  - Session store configured with `connect-redis` and `ioredis`.
  - Robust zero-setup design: Automatically connects to a live Redis server if running on `localhost:6379`, or falls back to embedded in-memory Redis mock (`ioredis-mock`) so it executes without crashes on any system.
  - **2 Protected Routes**:
    1. `/dashboard`: Displays Redis key (`student_sess:<id>`) and active session info.
    2. `/reports`: Inspects and displays the raw JSON session document directly queried from Redis.
  - Logout functionality that purges the session from Redis.

### Question 4: ERP Admin Panel - Employee CRUD, Bcrypt & Email
- **Features**:
  - Admin login with session authentication (`admin` / `admin123`).
  - Employee Mongoose model:
    - Auto-generated `empid` (e.g. `EMP1001`, `EMP1002`).
    - Password auto-generation and encryption using `bcrypt`.
    - Automatic salary calculation: `Net Salary = Basic Salary + Allowances - Deductions`.
  - Sends a welcome email with credentials to employee using `nodemailer` (shows test email preview link on screen).
  - Full CRUD operations with clean HTML forms and tables.

### Question 5: Employee Site with JWT Authentication & React.js
- **Features**:
  - Refers to Question 4's database and employees collection.
  - Employee login via JWT (`jsonwebtoken`) and encrypted password verification (`bcrypt.compare`).
  - Home page with links:
    - **Page 1**: Displays employee profile in an HTML table.
    - **Page 2**: Application for leave (fields: date, reason, grant yes/no/pending) with **Add** form and **List** table.
  - Logout button (clears JWT from storage).

### Question 6: Calling Free APIs (Frontend & Backend)
- **Features**:
  - **Backend API Call**: Live Currency Exchange Rate Converter powered by Express & `axios` calling `https://open.er-api.com/v6/latest/USD`.
  - **Frontend API Call**: Live City Weather Utility using client-side JavaScript `fetch()` calling `https://api.open-meteo.com/v1/forecast`, plus a Random Joke API calling `https://official-joke-api.appspot.com/random_joke`.
  - Results rendered in clean HTML tables with clear explanations of differences between frontend and backend API calls.

### Question 7: MERN Shopping Cart with 2-Level Categories
- **Features**:
  - **2-Level Category Hierarchy**: Parent Category (Level 1) & Subcategories (Level 2).
  - **Admin Site**:
    - Add Parent Category & Add Subcategory under selected parent.
    - List & Delete Categories.
    - Add, List & Delete Products linked to parent and subcategory.
  - **User Site**:
    - Filter and browse products by 2-level categories.
    - Add to Cart with quantity adjustment (+ / -) and item removal.
    - Total price calculation & Order checkout simulation.
  - Auto-seeds sample categories and products on startup.

### Question 8: Student CRUD with Sequelize ORM & React
- **Features**:
  - Student model managed using `Sequelize` ORM with an SQLite database (`students.sqlite` auto-created, zero configuration needed).
  - Fields: `rollNo`, `name`, `email`, `course`, `marks`, and auto-computed `grade`.
  - Full CRUD: Add Student, List Students in HTML table, Edit Student with form pre-fill, Delete Student.
  - React frontend communicating with Express REST API.
