// controllers/dashboardController.js
const Shelter = require('../models/shelter');
const getCurrentWeather = require('../utils/weatherService');
const predictDisasterRisk = require('../utils/disasterPrediction');

module.exports.getDashboard = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'lat and lng query params are required' });
        }

        const latitude = Number(lat);
        const longitude = Number(lng);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return res.status(400).json({ message: 'Invalid lat/lng' });
        }

        const RADIUS_METERS = 10000;

        const allShelters = await Shelter.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [longitude, latitude] },
                    $maxDistance: RADIUS_METERS
                }
            }
        }).catch(err => { console.error('Shelter fetch error:', err); return []; });

        const hospitals = allShelters.filter(
            s => s.type && String(s.type).toLowerCase().includes('hospital')
        );
        const shelters = allShelters.filter(
            s => !s.type || !String(s.type).toLowerCase().includes('hospital')
        );

        // FIX: always defined, even with no Alert model yet
        const alerts = [];

        const weather = await getCurrentWeather(latitude, longitude)
            .catch(err => { console.error('Weather fetch error:', err); return null; });

        let disasterRisk = null;
        if (weather) {
            try {
                disasterRisk = await predictDisasterRisk({
                    rainfall: weather.rainfall,
                    river_level: 3,
                    humidity: weather.humidity,
                    temperature: weather.temperature,
                    previous_floods: 2
                });
            } catch (err) {
                console.error('ML prediction error:', err);
                disasterRisk = { success: false, message: 'Prediction unavailable' };
            }
        }

        return res.status(200).json({
            activeAlerts: alerts.length,
            nearbyHospitals: hospitals.length,
            nearbyShelters: shelters.length,
            alerts,
            hospitals,
            shelters,
            disasterRisk,
            weather,
            features: weather ? {
                rainfall: weather.rainfall,
                humidity: weather.humidity,
                temperature: weather.temperature
            } : null
        });

    } catch (err) {
        console.error('Dashboard error:', err);
        return res.status(500).json({ message: 'Failed to load dashboard', error: err.message });
    }
};