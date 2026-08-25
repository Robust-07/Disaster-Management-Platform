const Campaign = require('../models/Campaign');

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
 	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to create campaign', error: err.message });
  	}
};

module.exports.getAllCampaigns = async (req, res) => {
	try {
    	const campaigns = await Campaign.find()
      	.populate('createdBy', 'name')
      	.sort({ createdAt: -1 });

    	res.status(200).json({ count: campaigns.length, campaigns });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to fetch campaigns', error: err.message });
  	}
};

module.exports.getCampaignById = async (req, res) => {
	try {
    	const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name');
    	if (!campaign) {
      		return res.status(404).json({ message: 'Campaign not found' });
    	}

    	res.status(200).json({ campaign });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to fetch campaign', error: err.message });
  	}
};

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

		const io = req.app.get('io');
		io.emit('campaign-donation', { campaignId: campaign._id, raisedAmount: campaign.raisedAmount });

    	res.status(200).json({ message: 'Donation recorded', campaign });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to process donation', error: err.message });
  	}
};

module.exports.verifyCampaign = async (req, res) => {
	try {
    	const campaign = await Campaign.findById(req.params.id);
    	if (!campaign) {
      		return res.status(404).json({ message: 'Campaign not found' });
    	}
		campaign.verified = true;
    	await campaign.save();

    	res.status(200).json({ message: 'Campaign verified', campaign });
  	} 
	catch (err) {
    	res.status(500).json({ message: 'Failed to verify campaign', error: err.message });
  	}
};