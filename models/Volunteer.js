// models/Volunteer.js
const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skills: [{ type: String }], // e.g. ["medical", "driving", "cooking", "first-aid"]
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
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
module.exports = mongoose.model('Volunteer', volunteerSchema);