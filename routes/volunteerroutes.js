const express = require('express');
const router = express.Router();
const {
  createVolunteer,
  getNearbyVolunteers,
  getAllVolunteers,
  matchVolunteers,
  updateAvailability,
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.post('/', protect, createVolunteer);
router.get('/nearby', protect, getNearbyVolunteers);
router.get('/', protect, authorize('authority', 'ngo'), getAllVolunteers);
router.post('/match', protect, authorize('authority'), matchVolunteers);
router.patch('/:id/availability', protect, updateAvailability);

module.exports = router;