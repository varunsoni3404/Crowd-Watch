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

const exportReports = async (req, res) => {
    try {
        const format = (req.query.format || 'csv').toLowerCase();

        // fetch all reports (no pagination) with useful fields
        const reports = await Report.find({})
            .populate('userId', 'username email')
            .populate('assignedAdmin', 'username')
            .sort({ createdAt: -1 });

        // Prepare rows
        const rows = reports.map(r => ({
            id: r._id.toString(),
            title: r.title || '',
            description: r.description || '',
            category: r.category || '',
            status: r.status || '',
            photoUrl: r.photoUrl || '',
            latitude: r.location?.latitude ?? '',
            longitude: r.location?.longitude ?? '',
            address: r.location?.address || '',
            user: r.userId ? `${r.userId.username || ''} <${r.userId.email || ''}>` : '',
            assignedAdmin: r.assignedAdmin ? r.assignedAdmin.username : '',
            adminNotes: r.adminNotes || '',
            additionalComments: r.additionalComments || '',
            createdAt: r.createdAt ? r.createdAt.toISOString() : '',
            statusUpdatedAt: r.statusUpdatedAt ? r.statusUpdatedAt.toISOString() : ''
        }));

        // Helper: CSV escape
        const escapeCsv = (val) => {
            if (val === null || val === undefined) return '';
            const str = String(val);
            if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
                return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
        };

        if (format === 'xlsx') {
            // Try to generate XLSX using exceljs if available, else fallback to csv
            try {
                const ExcelJS = require('exceljs');
                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('Reports');

                const headers = Object.keys(rows[0] || {});
                sheet.addRow(headers);

                rows.forEach(r => {
                    sheet.addRow(headers.map(h => r[h]));
                });

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename="reports.xlsx"');

                await workbook.xlsx.write(res);
                res.end();
                return;
            } catch (err) {
                console.warn('exceljs not available, falling back to CSV export', err.message);
                // continue to CSV fallback
            }
        }

        // CSV export
        const headers = Object.keys(rows[0] || {});
        const csvLines = [];
        csvLines.push(headers.map(escapeCsv).join(','));
        rows.forEach(r => {
            const line = headers.map(h => escapeCsv(r[h]));
            csvLines.push(line.join(','));
        });

        const csv = csvLines.join('\r\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reports.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Export reports error:', error);
        res.status(500).json({ success: false, message: 'Server error exporting reports', error: error.message });
    }
};

module.exports = {
    getAllReports,
    updateReportStatus,
    assignReport,
    deleteReport,
    getReportStats
    , exportReports
};
