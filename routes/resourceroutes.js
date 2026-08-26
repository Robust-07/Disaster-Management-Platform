const express = require("express");
const router = express.Router();

const {createResource, getNearByResources, getAllResources, matchResources, allocateResource,} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.post('/', protect, authorize('ngo', 'authority'), createResource);
router.get('/nearby', protect, authorize('authority'), getNearByResources);
router.get('/', protect, authorize('authority'), getAllResources);
router.post('/match', protect, authorize('authority'), matchResources);
router.post('/allocate', protect, authorize('authority'), allocateResource);

module.exports = router;