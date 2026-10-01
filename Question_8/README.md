# Question 8: Student CRUD with Sequelize ORM, Express & React

## Objective
Develop a full CRUD application for the **Student collection** using:
- **Sequelize ORM** (with zero-configuration SQLite database so it runs instantly without configuring a MySQL server).
- **Express.js** REST API backend.
- **React.js** frontend.
- Student fields: `rollNo`, `name`, `email`, `course`, `marks`, and auto-computed `grade`.
- Complete CRUD operations:
  - **Create**: Add new student with duplicate roll-number validation.
  - **Read**: Fetch and display all students in a formatted HTML table.
  - **Update**: Pre-fills the form to edit existing student data.
  - **Delete**: Removes student record with confirmation.
- Auto-seeding: Automatically populates sample student records on startup.

---

## File Structure
```text
Question_8/
├── package.json          # Express, Sequelize, SQLite3 dependencies
├── server.js             # REST API routes and SQLite database synchronization
├── models/
│   └── Student.js        # Sequelize Student Model with grade calculation hook
├── students.sqlite       # Auto-created SQLite database file
└── client/               # React Frontend (Vite)
    ├── package.json      # React dependencies
    ├── vite.config.js    # Vite configuration & proxy
    ├── index.html        # HTML entry point
    └── src/
        ├── main.jsx      # React root
        └── App.jsx       # Student CRUD UI (Form + Table)
```

---

## Step-by-Step Code Walkthrough

1. **Sequelize Model (`models/Student.js`)**:
   - Initialized with `sqlite` dialect and storage file `students.sqlite`.
   - Fields: `rollNo` (unique string), `name`, `email` (validated email), `course`, `marks` (0 to 100), and `grade`.
   - `beforeSave` hook computes the grade:
     - 85+ = A+
     - 75+ = A
     - 65+ = B
     - 50+ = C
     - 40+ = D
     - Below 40 = F (Fail)

2. **CRUD API Routes (`server.js`)**:
   - `GET /api/students`: `Student.findAll()`
   - `POST /api/students`: `Student.create()`
   - `GET /api/students/:id`: `Student.findByPk()`
   - `PUT /api/students/:id`: `student.save()`
   - `DELETE /api/students/:id`: `student.destroy()`

3. **React Frontend (`client/src/App.jsx`)**:
   - State-driven form handling both Create (POST) and Edit (PUT) modes.
   - Clean HTML table (`<table border="1">`) rendering all fields and action buttons.

---

## How to Install and Run

1. Open terminal and navigate to the `Question_8` folder:
   ```bash
   cd Question_8
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install client dependencies and build the React frontend:
   ```bash
   npm run build:client
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:3008
   ```
