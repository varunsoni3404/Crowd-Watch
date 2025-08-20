// server/routes/reports.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    createReport, 
    getUserReports, 
    getReportById, 
    updateReportStatus 
} = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private
router.post('/', auth, upload.single('photo'), createReport);

// @route   GET /api/reports/my-reports
// @desc    Get user's reports
// @access  Private
router.get('/my-reports', auth, getUserReports);

// @route   GET /api/reports/:id
// @desc    Get a specific report
// @access  Private
router.get('/:id', auth, getReportById);

// @route   PUT /api/reports/:id/status
// @desc    Update report status (for users to mark as read, etc.)
// @access  Private
router.put('/:id/status', auth, updateReportStatus);

module.exports = router;