const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
	{
		userId: { 
			type: mongoose.Schema.Types.ObjectId, 
			ref: 'User', 
			required: true 
		},
		skills: [{ type: String }], 
		location: {
			type: { 
				type: String, 
				enum: ['Point'], 
				default: 'Point' 
			},
			coordinates: { 
				type: [Number], 
				required: true 
			},
		},
		availability: {
			type: String,
			enum: ['available', 'busy', 'unavailable'],
			default: 'available',
		},
	},
	{ timestamps: true }
);

volunteerSchema.index({ location: '2dsphere' });

const Volunteer = mongoose.model("Volunteer", volunteerSchema);
module.exports = Volunteer;