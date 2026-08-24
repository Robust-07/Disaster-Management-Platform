const express = require('express');
const router = express.Router();

const {createCampaign, getAllCampaigns, getCampaignById, donateToCampaign, verifyCampaign} = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/authmiddleware');

router.post('/', protect, authorize('ngo', 'authority'), createCampaign);
router.get('/', protect, getAllCampaigns);
router.get('/:id', protect, getCampaignById);
router.patch('/:id/donate', protect, donateToCampaign);
router.patch('/:id/verify', protect, authorize('authority'), verifyCampaign);

module.exports = router;