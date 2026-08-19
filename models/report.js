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
        injuredPeople: {
            type: Number,
            required: [true, 'injured_people is required'],
            min: 0,
        },
        criticalInjuries: {
            type: Number,
            required: [true, 'critical_injuries is required'],
            min: 0,
        },
        childrenElderly: {
            type: Number,
            required: [true, 'children_elderly is required'],
            min: 0,
        },
        waterLevel: {
            type: Number,
            required: [true, 'water_level is required'],
            min: 0,
        },
        buildingDamage: {
            type: Number,
            required: [true, 'building_damage is required'],
            min: 0,
        },
        hoursTrapped: {
            type: Number,
            required: [true, 'hours_trapped is required'],
            min: 0,
        },
        communicationAvailable: {
            type: Number,
            required: [true, 'communication_available is required'],
            enum: [0, 1],
        },
        severityLabel: {
            type: String,
            default: null,
        },
        mlProbability: {
            type: Number,
            default: null,
        },
        isMlPredicted: {
            type: Boolean,
            default: false,
        },
        mlStatus: {
            type: String,
            default: 'PENDING',
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
    },
    {timestamps: true}
);
sosReportSchema.index({location: '2dsphere'});

const SOSReport = mongoose.model("sosReport", sosReportSchema);
module.exports = SOSReport;