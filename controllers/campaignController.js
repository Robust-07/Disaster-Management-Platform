const Campaign = require('../models/Campaign');

// @route  POST /api/campaigns
// @access Protected — ngo/authority only
module.exports.createCampaign = async (req, res) => {
  try {
    const { title, description, targetAmount } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({
        message: 'title and targetAmount are required',
      });
    }

    const campaign = await Campaign.create({
      title,
      description,
      targetAmount,
      createdBy: req.user.id,
    });

    res.status(201).json({ campaign });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create campaign', error: err.message });
  }
};

// @route  GET /api/campaigns
// @access Public-ish — any logged-in user can view active campaigns
module.exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ count: campaigns.length, campaigns });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
  }
};

// @route  GET /api/campaigns/:id
// @access Protected
module.exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json({ campaign });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch campaign', error: err.message });
  }
};

// @route  PATCH /api/campaigns/:id/donate
// @access Protected — any logged-in user can donate
// Body: { amount }
module.exports.donateToCampaign = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'A valid donation amount is required' });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.raisedAmount += Number(amount);
    await campaign.save();

    res.status(200).json({ message: 'Donation recorded', campaign });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process donation', error: err.message });
  }
};

// @route  PATCH /api/campaigns/:id/verify
// @access Protected — authority only
module.exports.verifyCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.verified = true;
    await campaign.save();

    res.status(200).json({ message: 'Campaign verified', campaign });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify campaign', error: err.message });
  }
};