const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema(
	{
		requesterId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		campName: {
			type: String,
			required: [true, 'Camp/location name is required'],
			trim: true,
		},
		location: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates: {
				type: [Number],
				required: true,
			},
		},
		type: {
			type: String,
			enum: ['food', 'water', 'medicine', 'beds', 'clothing', 'other'],
			required: true,
		},
		quantityNeeded: {
			type: Number,
			required: [true, 'Quantity needed is required'],
			min: 0,
		},
		quantityFulfilled:{
			type: Number,
			default: 0,
		},
		population: {
			type: Number,
			default: 0,
			min: 0
		},
		incomingSupply: {
			type: Number,
			default: 0,
			min: 0
		},
		peoplePerUnit: {
			type: Number,
			default: 1,
			min: 0
		},
		currentStock: {
			type: Number,
			default: 0,
			min: 0
		},
		dailyConsumption: {
			type: Number,
			default: 0,
			min: 0
		},
		shortageHours: {
			type: Number,
			default: null
		},
		shortageStatus: {
			type: String,
			enum: ['CRITICAL', 'WARNING', 'MONITOR', 'SAFE'],
			default: null
		},
		isShortageMlPredicted: {
			type: Boolean,
			default: false
		},
		shortageMlStatus: {
			type: String,
			default: null
		},
		consumptionRatePerHour: {
			type: Number,
			default: 0,
		},
		urgency: {
			type: String,
			enum: ['low', 'medium', 'high', 'critical'],
			default: 'medium',
		},
		status: {
			type: String,
			enum: ['open', 'partially-fulfilled', 'fulfilled'],
			default: 'open',
		},
		matchedResourceId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Resource',
			default: null,
		},
	},
	{ timestamps: true }
);

resourceRequestSchema.index({ location: '2dsphere' });

const ResourceRequest = mongoose.model("ResourceRequest", resourceRequestSchema);
module.exports = ResourceRequest;