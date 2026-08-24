const express = require('express');
const router = express.Router();
const {
  createResourceRequest,
  getAllResourceRequests,
  getShortageAlerts,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('authority'), createResourceRequest);
router.get('/shortage-alerts', protect, authorize('authority'), getShortageAlerts);
router.get('/', protect, authorize('authority', 'ngo'), getAllResourceRequests);

module.exports = router;