const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    photoUrl: {
        type: String,
        required: true
    },
    location: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        address: String
    },
    category: {
        type: String,
        required: true,
        enum: ['Potholes', 'Sanitation', 'Streetlights', 'Water Supply', 'Drainage', 'Traffic', 'Parks', 'Other']
    },
    status: {
        type: String,
        enum: ['Submitted', 'In Progress', 'Resolved'],
        default: 'Submitted'
    },
    adminNotes: {
        type: String,
        maxlength: 500
    },
    assignedAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    statusUpdatedAt: {
        type: Date,
        default: Date.now
    },
    additionalComments: {
        type: String,
        maxlength: 1000
    }
}, {
    timestamps: true
});

// Indexes for performance
reportSchema.index({ userId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ category: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Report', reportSchema);