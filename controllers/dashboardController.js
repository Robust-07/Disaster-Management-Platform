const Shelter = require('../models/shelter');
const RiskZone = require('../models/riskzone'); // adjust to your actual filename
const { getDistanceKm } = require('../utils/resourceMatching');
const getShelterStatus = require('../utils/shelterStatus');
const sendError = require('../utils/errorResponse');

const riskLevelDisplay = {
    low: 'Low',
    medium: 'Moderate',
    high: 'High',
    critical: 'Critical',
};

// @route  GET /api/dashboard?lat=..&lng=..
// @access Protected — any logged-in user
module.exports.getDashboardData = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'lat and lng query params are required' });
        }

        const userCoords = [Number(lng), Number(lat)];

        // --- Nearby hospitals & shelters (reuse existing geospatial query) ---
        const nearbyPlaces = await Shelter.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: userCoords },
                    $maxDistance: 15000, // 15km
                },
            },
        });

        const hospitals = nearbyPlaces
            .filter((p) => p.type === 'hospital')
            .map((p) => ({
                ...p.toObject(),
                availableCapacity: p.capacity !== null ? p.capacity - p.currentOccupancy : null,
                status: getShelterStatus(p.capacity, p.currentOccupancy),
            }));

        const shelters = nearbyPlaces
            .filter((p) => p.type === 'shelter')
            .map((p) => ({
                ...p.toObject(),
                availableCapacity: p.capacity !== null ? p.capacity - p.currentOccupancy : null,
                status: getShelterStatus(p.capacity, p.currentOccupancy),
            }));

        // --- Risk level (closest active risk zone within 15km) ---
        const activeZones = await RiskZone.find({ active: true });
        let closestZone = null;
        let closestDistance = Infinity;

        for (const zone of activeZones) {
            const distance = getDistanceKm(userCoords, zone.location.coordinates);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestZone = zone;
            }
        }

        const riskLevel =
            closestZone && closestDistance <= 15
                ? riskLevelDisplay[closestZone.riskLevel] || 'Unknown'
                : 'Unknown';

        // --- Active alerts (all nearby active risk zones, formatted for the frontend) ---
        const alerts = activeZones
            .map((zone) => ({
                zone, distance: getDistanceKm(userCoords, zone.location.coordinates)}))
            .filter((z) => z.distance <= 15)
            .map(({ zone, distance }) => ({
                id: zone._id,
                title: zone.areaName,
                description: zone.description,
                severity: zone.riskLevel,
                distanceKm: Math.round(distance * 10) / 10,
                location: zone.location,
            }));

        res.status(200).json({
            activeAlerts: alerts.length,
            nearbyHospitals: hospitals.length,
            nearbyShelters: shelters.length,
            riskLevel,
            alerts,
            hospitals,
            shelters,
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to load dashboard data', error: err.message });
        return sendError(res, 500, 'Failed to create resource', err);
    }
};