const mongoose = require('mongoose');
const riskZoneSchema = new mongoose.Schema(
	{
		areaName:{
			type: 'String',
			required: [true, 'Area name is required'],
			trim: true,
		},
		location:{
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates:{
				type: [Number], 
				required: true,

			},
		},
		riskLevel:{
			type: String,
			enum: ['low', 'medium', 'high', 'critical'],
			required: true,
			default: 'low',
		},
		description:{
			type: String,
			trim: true,
			default: '',
		},
		active:{
			type: Boolean,
			default: true,
		}
	},
	{ timestamps: true }
);
riskZoneSchema.index({location:'2dsphere'});

const RiskZone = mongoose.model("RiskZone", riskZoneSchema);
module.exports = RiskZone;