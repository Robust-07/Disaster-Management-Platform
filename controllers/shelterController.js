const Shelter = require("../models/shelter.js");

module.exports.createShelter = async (req, res) => {
  try {
    const { name, type, longitude, latitude, address, contact, capacity } = req.body;

    if (!name || !type || longitude === undefined || latitude === undefined || !contact) {
      return res.status(400).json({
        message: 'name, type, longitude, latitude and contact are required',
      });
    }

    const shelter = await Shelter.create({
      name,
      type,
      address,
      contact,
      capacity,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
    });

    res.status(201).json({ shelter });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create shelter', error: err.message });
  }
};

module.exports.getAllShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find().sort({ createdAt: -1 });
    res.status(200).json({ count: shelters.length, shelters });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shelters', error: err.message });
  }
};

module.exports.getNearbyShelters = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'longitude and latitude query params are required' });
    }

    const shelters = await Shelter.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: Number(maxDistance) || 10000, // default 10km
        },
      },
    });

    res.status(200).json({ count: shelters.length, shelters });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch nearby shelters', error: err.message });
  }
};
