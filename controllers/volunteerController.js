const Volunteer = require('../models/Volunteer.js');

//createVolunteer, getNearbyVolunteers, getAllVolunteers, matchVolunteers, updateAvailability

module.exports.createVolunteer = async (req, res) => {
	try {
    	const { skills, longitude, latitude, availability } = req.body;
		if (!skills || !Array.isArray(skills) || skills.length === 0 || longitude === undefined || latitude === undefined) {
      		return res.status(400).json({
        		message: 'skills (as an array), longitude and latitude are required',
      		});
    	}
		const volunteer = await Volunteer.create({
      		userId: req.user.id,
      		skills,
      		availability: availability || 'available',
      		location: {
        		type: 'Point',
        		coordinates: [Number(longitude), Number(latitude)],
      		},
    	});

		const io = req.app.get('io');
  		io.emit('new-volunteer', volunteer);

    	res.status(201).json({ volunteer });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to register volunteer', error: err.message });
  	}
};

module.exports.getNearbyVolunteers = async (req, res) => {
	try {
    	const { longitude, latitude, skill, maxDistance } = req.query;
		if (!longitude || !latitude) {
      		return res.status(400).json({ message: 'longitude and latitude query params are required' });
    	}
		const query = {
      		availability: 'available',
      		location: {
        		$near: {
          			$geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
          			$maxDistance: Number(maxDistance) || 20000,
        		},
      		},
    	};
    	if (skill) query.skills = skill;
		const volunteers = await Volunteer.find(query).populate('userId', 'name phone email');
    	res.status(200).json({ count: volunteers.length, volunteers });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to fetch nearby volunteers', error: err.message });
  	}
};

module.exports.getAllVolunteers = async (req, res) => {
	try {
    	const volunteers = await Volunteer.find()
      	.populate('userId', 'name phone email')
      	.sort({ createdAt: -1 });
    	res.status(200).json({ count: volunteers.length, volunteers });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to fetch volunteers', error: err.message });
  	}
};

module.exports.matchVolunteers = async (req, res) => {
	try {
    	const { requiredSkill, longitude, latitude, maxDistance } = req.body;

    	if (!requiredSkill || longitude === undefined || latitude === undefined) {
      		return res.status(400).json({
        		message: 'requiredSkill, longitude and latitude are required',
      		});
    	}

    	const candidates = await Volunteer.find({
      		skills: requiredSkill,
      		availability: 'available',
      		location: {
        		$near: {
          			$geometry: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] },
          			$maxDistance: Number(maxDistance) || 20000,
        		},
      		},
    	}).populate('userId', 'name phone email');

    	res.status(200).json({
      		count: candidates.length,
      		matches: candidates, // already sorted nearest-first by $near
    	});
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to match volunteers', error: err.message });
  	}
};

module.exports.updateAvailability = async (req, res) => {
	try {
    	const { availability } = req.body;
    	const validStatuses = ['available', 'busy', 'unavailable'];
		if (!availability || !validStatuses.includes(availability)) {
      		return res.status(400).json({
        		message: `availability must be one of: ${validStatuses.join(', ')}`,
      		});
    	}
		const volunteer = await Volunteer.findById(req.params.id);
    	if (!volunteer) {
      		return res.status(404).json({ message: 'Volunteer record not found' });
    	}
		if (volunteer.userId.toString() !== req.user.id) {
      		return res.status(403).json({ message: 'Not authorized to update this record' });
    	}

        volunteer.availability = availability;
        await volunteer.save();

        res.status(200).json({ message: 'Availability updated', volunteer });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to update availability', error: err.message });
  	}
};