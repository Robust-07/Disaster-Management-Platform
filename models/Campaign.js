// models/Campaign.js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    targetAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("campaign", campaignSchema);
module.exports = Campaign;