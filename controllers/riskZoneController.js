const Shelter = require('../models/shelter');
const RiskZone = require('../models/riskzone');

const { getDistanceKm } = require('../utils/resourceMatching');
const getShelterStatus = require('../utils/shelterStatus');
const predictDisasterRisk =
    require('../utils/disasterPrediction');

const getCurrentWeather =
    require('../utils/weatherService');


// =========================================================
// CREATE RISK ZONE
// =========================================================

module.exports.createRiskZone = async (req, res) => {

    try {

        const {
            areaName,
            longitude,
            latitude,
            riskLevel,
            description
        } = req.body;

        if (
            !areaName ||
            longitude === undefined ||
            latitude === undefined ||
            !riskLevel
        ) {
            return res.status(400).json({
                message:
                    'areaName, longitude, latitude and riskLevel are required'
            });
        }

        const riskZone = await RiskZone.create({

            areaName,

            riskLevel,

            description,

            location: {
                type: 'Point',

                coordinates: [
                    Number(longitude),
                    Number(latitude)
                ]
            }

        });

        const io = req.app.get('io');

        if (io) {
            io.emit('new-risk-zone', riskZone);
        }

        return res.status(201).json({
            riskZone
        });

    } catch (err) {

        console.error(
            "Create risk zone error:",
            err
        );

        return res.status(500).json({
            message:
                'Failed to create risk zone',

            error:
                err.message
        });
    }
};


// =========================================================
// GET ALL RISK ZONES
// =========================================================

module.exports.getAllRiskZones = async (req, res) => {

    try {

        const riskZones =
            await RiskZone
                .find({ active: true })
                .sort({ createdAt: -1 });

        return res.status(200).json({

            count:
                riskZones.length,

            riskZones

        });

    } catch (err) {

        return res.status(500).json({

            message:
                'Failed to fetch risk zones',

            error:
                err.message

        });
    }
};


// =========================================================
// UPDATE RISK ZONE
// =========================================================

module.exports.updateRiskZone = async (req, res) => {

    try {

        const {
            riskLevel,
            description,
            active
        } = req.body;

        const riskZone =
            await RiskZone.findById(
                req.params.id
            );

        if (!riskZone) {

            return res.status(404).json({
                message:
                    'Risk zone not found'
            });

        }

        if (riskLevel) {
            riskZone.riskLevel =
                riskLevel;
        }

        if (description !== undefined) {
            riskZone.description =
                description;
        }

        if (active !== undefined) {
            riskZone.active =
                active;
        }

        await riskZone.save();

        return res.status(200).json({
            riskZone
        });

    } catch (err) {

        return res.status(500).json({

            message:
                'Failed to update risk zone',

            error:
                err.message

        });
    }
};


// =========================================================
// DISASTER ML PREDICTION
// =========================================================
// POST /api/risk-zones/predict-disaster
//
// Frontend sends:
//
// {
//   latitude,
//   longitude
// }
//
// Backend gets real weather and sends
// 5 features to ML service.
// =========================================================

module.exports.predictDisaster = async (req, res) => {

    try {

        const {
            latitude,
            longitude
        } = req.body;

        // -------------------------------------------------
        // VALIDATE LOCATION
        // -------------------------------------------------

        if (
            latitude === undefined ||
            longitude === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Latitude and longitude are required"

            });
        }

        const lat = Number(latitude);
        const lon = Number(longitude);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid latitude or longitude"

            });
        }


        // -------------------------------------------------
        // GET REAL WEATHER
        // -------------------------------------------------

        const weather =
            await getCurrentWeather(
                lat,
                lon
            );


        console.log(
            "Real weather:",
            weather
        );


        // -------------------------------------------------
        // TEMPORARY VALUES
        // -------------------------------------------------
        //
        // IMPORTANT:
        //
        // These two values are NOT available from the
        // normal weather API.
        //
        // Your ML model requires them because they were
        // used while training.
        //
        // Replace these later with:
        //
        // river level API / river station data
        // historical flood database
        //
        // -------------------------------------------------

        const riverLevel = 3;

        const previousFloods = 2;


        // -------------------------------------------------
        // SEND DATA TO ML SERVICE
        // -------------------------------------------------

        const prediction =
            await predictDisasterRisk({

                rainfall:
                    weather.rainfall,

                river_level:
                    riverLevel,

                humidity:
                    weather.humidity,

                temperature:
                    weather.temperature,

                previous_floods:
                    previousFloods

            });


        console.log(
            "ML prediction:",
            prediction
        );


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            location: {
                latitude: lat,
                longitude: lon
            },

            weather,

            features: {

                rainfall:
                    weather.rainfall,

                river_level:
                    riverLevel,

                humidity:
                    weather.humidity,

                temperature:
                    weather.temperature,

                previous_floods:
                    previousFloods

            },

            disasterRisk:
                prediction

        });


    } catch (error) {

        console.error(
            "Disaster prediction error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to predict disaster risk",

            error:
                error.message

        });

    }

};