const express = require('express');
const router = express.Router();

const { getDashboardData } = require('../controllers/dashboardController.js');
const { protect } = require('../middleware/authmiddleware.js');

router.get('/', protect, getDashboardData);

module.exports = router;