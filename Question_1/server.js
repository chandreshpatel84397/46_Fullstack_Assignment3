// ============================================================
// Question 1: User Registration with Express, EJS, Multer & Validations
// ============================================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3001;

// 1. Setup EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middlewares for form data and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 3. Setup Multer Storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Unique filename using timestamp + original name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to allow only image files (jpg, jpeg, png, gif)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|gif/;
    const ext = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedExtensions.test(file.mimetype);

    if (ext && mime) {
        cb(null, true);
    } else {
        cb(new Error(`Only image files (.jpg, .png, .gif) are allowed for ${file.fieldname}!`));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: fileFilter
});

// Configure upload for:
// - single file: "profilePic"
// - multiple files: "otherPics" (max 5)
const uploadFields = upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'otherPics', maxCount: 5 }
]);

// 4. Routes

// GET: Display Registration Form
app.get('/', (req, res) => {
    res.render('register', {
        errors: [],
        oldData: {},
        errorMessage: null
    });
});

// Validation rules using express-validator
const registrationValidationRules = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required.')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Please enter a valid email address.'),
    body('password')
        .notEmpty().withMessage('Password is required.')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('confirmPassword')
        .notEmpty().withMessage('Confirm password is required.')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match.');
            }
            return true;
        }),
    body('gender')
        .notEmpty().withMessage('Please select your gender.'),
    body('hobbies')
        .custom((value) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
                throw new Error('Please select at least one hobby.');
            }
            return true;
        })
];

// POST: Handle Registration Form Submission
app.post('/register', (req, res) => {
    uploadFields(req, res, async (err) => {
        let multerError = null;
        if (err) {
            multerError = err.message;
        }

        // Run validation rules
        await Promise.all(registrationValidationRules.map(validation => validation.run(req)));
        const errors = validationResult(req);

        // Check if profilePic was uploaded
        const profilePic = req.files && req.files['profilePic'] ? req.files['profilePic'][0] : null;
        const otherPics = req.files && req.files['otherPics'] ? req.files['otherPics'] : [];

        let errorList = errors.array();
        if (multerError) {
            errorList.push({ msg: multerError });
        }
        if (!profilePic) {
            errorList.push({ msg: 'Profile picture is required.' });
        }

        // Normalize hobbies to an array for easy rendering
        let hobbies = req.body.hobbies || [];
        if (typeof hobbies === 'string') {
            hobbies = [hobbies];
        }

        // In case of invalid data: display errors along with all previous field values
        if (errorList.length > 0) {
            return res.render('register', {
                errors: errorList,
                oldData: {
                    ...req.body,
                    hobbies: hobbies
                },
                errorMessage: 'Please fix the errors below and submit again.'
            });
        }

        // In case of all valid fields: display in a well formatted tabular form
        res.render('success', {
            user: {
                username: req.body.username,
                email: req.body.email,
                gender: req.body.gender,
                hobbies: hobbies,
                profilePic: profilePic.filename,
                otherPics: otherPics.map(f => f.filename)
            }
        });
    });
});

// Download route: allows the user to download an uploaded file
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // Check if the file exists on the server
    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                res.status(500).send('Error occurred while downloading the file.');
            }
        });
    } else {
        res.status(404).send('File not found on server.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Question 1 Server running at http://localhost:${PORT}`);
});
