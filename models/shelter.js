const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        type:{
            type: String,
            enum: ['hospital', 'shelter', 'ambulance', 'blood-bank'],
            required: true,
        },
        location:{
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
        address:{
            type: String,
            trim: true,
            default: '',
        },
        contact:{
            type: String,
            required: [true, 'Contact number is required'],
        },
        capacity:{
            type: Number,
            default: null,
        },
        currentOccupancy: {
            type: Number,
            default: 0,
            min: 0,
        },
        facilities: {
            type: [String],
            default: [],
        },
    },
    {timestamps: true},
);

shelterSchema.index({location: '2dsphere'});

const Shelter = mongoose.model("Shelter", shelterSchema);
module.exports = Shelter;