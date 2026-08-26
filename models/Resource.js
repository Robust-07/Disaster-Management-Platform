const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
	{
		providerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String,
			enum: ['food', 'water', 'medicine', 'beds', 'clothing', 'other'],
			required: true,
		},
		quantity: {
			type: Number,
			required: [true, 'Quantity is required'],
			min: 0,
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
		transportAvailable: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			enum: ['available', 'allocated', 'depleted'],
			default: 'available',
		},
	},
	{ timestamps: true }
);

resourceSchema.index({ location: '2dsphere' });

const Resource = mongoose.model("Resource", resourceSchema);
module.exports = Resource;