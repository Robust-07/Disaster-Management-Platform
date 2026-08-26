const express = require('express');
const router = express.Router();

const {createSOS, getAllSOS, getSOSById, getMySOS, updateSOSStatus, cancelSOS} = require('../controllers/sosController.js');
const {protect, authorize} = require('../middleware/authmiddleware.js');
const upload = require('../middleware/storagemiddleware.js');

router.post('/', protect, upload.single('photo'), createSOS);
router.get('/', protect, authorize('authority', 'rescuer'), getAllSOS);
router.get('/my-reports', protect, getMySOS);
router.get('/:id', protect, getSOSById);
router.patch('/:id/status', protect, authorize('authority', 'rescuer'), updateSOSStatus);
router.delete('/:id', protect, cancelSOS);

module.exports = router;