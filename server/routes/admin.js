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

router.get('/reports', adminAuth, getAllReports);

router.put('/reports/:id/status', adminAuth, updateReportStatus);

router.put('/reports/:id/assign', adminAuth, assignReport);

router.delete('/reports/:id', adminAuth, deleteReport);

router.get('/stats', adminAuth, getReportStats);

module.exports = router;