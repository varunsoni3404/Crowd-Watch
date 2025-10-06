// server/controllers/reportController.js
const Report = require('../models/Report');
const path = require('path');

const createReport = async (req, res) => {
    try {
    const { title, description, latitude, longitude, address, category, additionalComments } = req.body;
        
        // Validation
        if (!title || !description || !latitude || !longitude || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a photo'
            });
        }

        // Create report
        const report = new Report({
            userId: req.user._id,
            title,
            description,
            photoUrl: `/uploads/${req.file.filename}`,
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address
            },
            category,
            additionalComments
        });

        await report.save();
        await report.populate('userId', 'username email');

        // 🔥 Emit socket event for all clients
        const io = req.app.get('io');
        if (io) io.emit('reportCreated', report);

        res.status(201).json({
            success: true,
            message: 'Report created successfully',
            report
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating report',
            error: error.message
        });
    }
};

const getUserReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reports = await Report.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('assignedAdmin', 'username');

        const total = await Report.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            reports,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalReports: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get user reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching reports',
            error: error.message
        });
    }
};

const getReportById = async (req, res) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('assignedAdmin', 'username');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching report',
            error: error.message
        });
    }
};

const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const report = await Report.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (status && ['Submitted', 'In Progress', 'Resolved'].includes(status)) {
            report.statusUpdatedAt = new Date();
            await report.save();

            const io = req.app.get('io');
            if (io) io.emit('reportUpdated', report);
        }

        res.json({
            success: true,
            message: 'Report updated successfully',
            report
        });
    } catch (error) {
        console.error('Update report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating report',
            error: error.message
        });
    }
};

const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        await Report.findByIdAndDelete(req.params.id);

        const io = req.app.get('io');
        if (io) io.emit('reportDeleted', req.params.id);

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting report',
            error: error.message
        });
    }
};

module.exports = {
    createReport,
    getUserReports,
    getReportById,
    updateReportStatus,
    deleteReport   
};
