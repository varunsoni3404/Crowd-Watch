// server/controllers/adminController.js
const Report = require('../models/Report');
const User = require('../models/User');

const getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.category) filter.category = req.query.category;
        
        // Build sort object
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sort = { [sortBy]: sortOrder };

        const reports = await Report.find(filter)
            .populate('userId', 'username email')
            .populate('assignedAdmin', 'username')
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Report.countDocuments(filter);

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
        console.error('Get all reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching reports',
            error: error.message
        });
    }
};

const updateReportStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        
        if (!status || !['Submitted', 'In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided'
            });
        }

        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Update report
        report.status = status;
        if (adminNotes) report.adminNotes = adminNotes;
        report.assignedAdmin = req.user._id;
        report.statusUpdatedAt = new Date();

        await report.save();

        await report.populate('userId', 'username email');
        await report.populate('assignedAdmin', 'username');

        // 🔥 Emit socket event
        const io = req.app.get('io');
        if (io) io.emit('reportUpdated', report);

        res.json({
            success: true,
            message: 'Report status updated successfully',
            report
        });
    } catch (error) {
        console.error('Update report status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating report status',
            error: error.message
        });
    }
};

const assignReport = async (req, res) => {
    try {
        const { adminId } = req.body;
        
        // Verify admin exists
        const admin = await User.findOne({ _id: adminId, role: 'admin' });
        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Invalid admin ID provided'
            });
        }

        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.assignedAdmin = adminId;
        if (report.status === 'Submitted') {
            report.status = 'In Progress';
        }
        report.statusUpdatedAt = new Date();

        await report.save();
        await report.populate('userId', 'username email');
        await report.populate('assignedAdmin', 'username');

        // 🔥 Emit socket event
        const io = req.app.get('io');
        if (io) io.emit('reportUpdated', report);

        res.json({
            success: true,
            message: 'Report assigned successfully',
            report
        });
    } catch (error) {
        console.error('Assign report error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error assigning report',
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

        // 🔥 Emit socket event with deleted ID
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

const getReportStats = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const submittedReports = await Report.countDocuments({ status: 'Submitted' });
        const inProgressReports = await Report.countDocuments({ status: 'In Progress' });
        const resolvedReports = await Report.countDocuments({ status: 'Resolved' });

        const reportsByCategory = await Report.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const reportsByStatus = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const reportsOverTime = await Report.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const recentReports = await Report.find()
            .populate('userId', 'username')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title status category createdAt userId');

        res.json({
            success: true,
            stats: {
                totalReports,
                submittedReports,
                inProgressReports,
                resolvedReports,
                reportsByCategory,
                reportsByStatus,
                reportsOverTime,
                recentReports
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching statistics',
            error: error.message
        });
    }
};

module.exports = {
    getAllReports,
    updateReportStatus,
    assignReport,
    deleteReport,
    getReportStats
};
