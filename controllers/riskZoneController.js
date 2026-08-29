const RiskZone = require('../models/riskzone.js');
const predictDisasterRisk = require('../utils/disasterPrediction.js');

module.exports.createRiskZone = async (req, res) => {
    try {
        const { areaName, longitude, latitude, riskLevel, description } = req.body;
        if (!areaName || longitude === undefined || latitude === undefined || !riskLevel) {
            return res.status(400).json({
                message: 'areaName, longitude, latitude and riskLevel are required',
            });
        }
        const riskZone = await RiskZone.create({
            areaName,
            riskLevel,
            description,
            location: {
                type: 'Point',
                coordinates: [Number(longitude), Number(latitude)],
            },
        });

        const io = req.app.get('io');
        io.emit('new-risk-zone', riskZone);

        res.status(201).json({ riskZone });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to create risk zone', error: err.message });
    }
};

module.exports.getAllRiskZones = async (req, res) => {
    try {
        const riskZones = await RiskZone.find({ active: true }).sort({ createdAt: -1 });
        res.status(200).json({ count: riskZones.length, riskZones });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch risk zones', error: err.message });
    }
};

module.exports.updateRiskZone = async (req, res) => {
    try {
        const { riskLevel, description, active } = req.body;
        const riskZone = await RiskZone.findById(req.params.id);
        if (!riskZone) {
            return res.status(404).json({ message: 'Risk zone not found' });
        }
        if (riskLevel) riskZone.riskLevel = riskLevel;
        if (description !== undefined) riskZone.description = description;
        if (active !== undefined) riskZone.active = active;
        await riskZone.save();
        res.status(200).json({ riskZone });
    } 
    catch (err) {
        res.status(500).json({ message: 'Failed to update risk zone', error: err.message });
    }
};

// @access Protected
module.exports.getDisasterRiskPrediction = async (req, res) => {
    try {
        const { rainfall, river_level, humidity, temperature, previous_floods } = req.body;

        const prediction = await predictDisasterRisk({
            rainfall,
            river_level,
            humidity,
            temperature,
            previous_floods,
        });

        res.status(200).json(prediction);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to predict disaster risk', error: err.message });
    }
};

