const express = require('express');
const router = express.Router();

const {createRiskZone, getAllRiskZones, updateRiskZone, getDisasterRiskPrediction} = require("../controllers/riskZoneController.js");
const {protect, authorize} = require("../middleware/authmiddleware.js");

router.post('/predict-disaster', protect, getDisasterRiskPrediction);
router.post('/', protect, authorize('authority'), createRiskZone);
router.get('/', protect, getAllRiskZones);
router.patch('/:id', protect, authorize('authority'), updateRiskZone);

module.exports = router;


