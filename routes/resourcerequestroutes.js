const express = require("express");
const router = express.Router();

const {createResourceRequest, getAllResourceRequests, getShortageAlerts} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.post('/', protect, authorize('citizen', 'authority'), createResourceRequest);
router.get('/shortage-alerts', protect, authorize('authority'), getShortageAlerts);
router.get('/', protect, authorize('authority', 'ngo'), getAllResourceRequests);

module.exports = router;