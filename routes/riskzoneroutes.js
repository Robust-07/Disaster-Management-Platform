const express = require('express');
const router = express.Router();

const {createRiskZone, getAllRiskZones, updateRiskZone} = require("../controllers/riskZoneController.js");
const {protect, authorize} = require("../middleware/authmiddleware.js");

router.post('/', protect, authorize('authority'), createRiskZone);
router.get('/', protect, getAllRiskZones);
router.patch('/:id', protect, authorize('authority'), updateRiskZone);

module.exports = router;


