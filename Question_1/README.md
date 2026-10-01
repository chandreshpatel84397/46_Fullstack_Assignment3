# Question 1: User Registration with Validations and File Upload/Download

## Objective
Develop a user registration form with:
- Fields: username, password, confirm password, email, gender (radio), hobbies (checkboxes), upload profile pic (single file), upload other pics (multiple files).
- Form contains file upload with single and multiple file support and validations.
- In case of invalid data: display errors along with all previous field values (sticky form).
- In case of valid fields: display all data and images in a well-formatted tabular form.
- Provide a route for downloading uploaded files using Express.
- Tech Stack: `Express`, `EJS`, `express-validator`, `multer`.

---

## File Structure
```text
Question_1/
├── package.json          # Node dependencies and scripts
├── server.js             # Main Express server, validations, multer config, routes
├── public/
│   └── uploads/          # Directory where uploaded images are saved
└── views/
    ├── register.ejs      # Registration form with sticky inputs & error display
    └── success.ejs       # Tabular view showing submitted data & file downloads
```

---

## Step-by-Step Code Walkthrough

1. **Multer Configuration (`server.js`)**:
   - `diskStorage`: Configured to save uploaded files into `public/uploads` with a unique timestamp prefix to prevent name collisions.
   - `fileFilter`: Validates file extensions and MIME types so only image files (`.jpg`, `.jpeg`, `.png`, `.gif`) are accepted.
   - `upload.fields(...)`: Accepts `profilePic` (single file, max 1) and `otherPics` (multiple files, max 5).

2. **Form Validations (`express-validator`)**:
   - `username`: Required, minimum 3 characters.
   - `email`: Required, valid email format.
   - `password`: Required, minimum 6 characters.
   - `confirmPassword`: Custom validator checks if it matches `password`.
   - `gender`: Required (radio button).
   - `hobbies`: Custom validator checks that at least one hobby checkbox is selected.
   - `profilePic`: Checked to ensure a file was uploaded.

3. **Sticky Form & Error Handling**:
   - When validation fails, `res.render('register', { errors, oldData })` passes back the errors list along with the previously typed values so the user does not have to retype everything.
   - Radio buttons and checkboxes check against `oldData` to restore the user's selections.

4. **Tabular Results & File Download Route**:
   - On valid submission, `success.ejs` renders an HTML table (`<table border="1">`) displaying all details and image previews.
   - Route `/download/:filename`: Uses Express's built-in `res.download(filePath, filename)` to trigger a browser file download when the student clicks the "Download" button.

---

## How to Install and Run

1. Open terminal and navigate to the `Question_1` folder:
   ```bash
   cd Question_1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and go to:
   ```text
   http://localhost:3001
   ```
