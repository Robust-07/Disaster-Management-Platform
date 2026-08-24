const mongoose = require('mongoose');
const sosReportSchema = new mongoose.Schema(
    {
        reporterId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
            
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        peopleCount: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
        photoUrl: {
            type: String,
            default: null,
        },
        severityScore: {
            type: Number,
            default: 0,
        },
        severityLabel: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL", "HEURISTIC_FALLBACK"],
            default: "LOW"
        },
        mlProbability: {
            type: Number,
            default: null
        },
        isMlPredicted: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            enum: ['medical', 'rescue', 'evacuation', 'other'],
            default: 'other',
        },
        status: {
            type: String,
            enum: ['pending', 'assigned', 'in-progress', 'resolved'],
            default: 'pending',
        },
        assignedTeamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RescueTeam',
            default: null,
        },
        cancelledAt: {
            type: Date,
            default: null,
        },
    },
    {timestamps: true}
);
sosReportSchema.index({location: '2dsphere'});

const SOSReport = mongoose.model("sosReport", sosReportSchema);
module.exports = SOSReport;