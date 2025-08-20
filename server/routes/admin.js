// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { 
    getAllReports, 
    updateReportStatus, 
    getReportStats,
    deleteReport,
    assignReport 
} = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// @route   GET /api/admin/reports
// @desc    Get all reports with filtering and pagination
// @access  Admin only
router.get('/reports', adminAuth, getAllReports);

// @route   PUT /api/admin/reports/:id/status
// @desc    Update report status and add admin notes
// @access  Admin only
router.put('/reports/:id/status', adminAuth, updateReportStatus);

// @route   PUT /api/admin/reports/:id/assign
// @desc    Assign report to an admin
// @access  Admin only
router.put('/reports/:id/assign', adminAuth, assignReport);

// @route   DELETE /api/admin/reports/:id
// @desc    Delete a report
// @access  Admin only
router.delete('/reports/:id', adminAuth, deleteReport);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/stats', adminAuth, getReportStats);

module.exports = router;