const express = require("express");
const router = express.Router();

const {
  createShelter,
  getAllShelters,
  getNearbyShelters,
} = require('../controllers/shelterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('authority'), createShelter);
router.get('/nearby', protect, getNearbyShelters);
router.get('/', protect, getAllShelters);

module.exports = router;