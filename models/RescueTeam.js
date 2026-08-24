const mongoose = require("mongoose");

const rescueTeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    organization: {
      type: String,
      required: true,
      trim: true,
    },

    teamType: {
      type: String,
      enum: [
        "MEDICAL",
        "FIRE",
        "POLICE",
        "NDRF",
        "DISASTER_RESPONSE",
        "SEARCH_AND_RESCUE",
        "OTHER",
      ],
      required: true,
    },

    members: {
      type: Number,
      required: true,
      min: 1,
    },

    capabilities: {
      type: [String],
      default: [],
    },

    equipment: {
      type: [String],
      default: [],
    },

    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    availability: {
      type: Boolean,
      default: true,
    },

    currentStatus: {
      type: String,
      enum: [
        "AVAILABLE",
        "BUSY",
        "EN_ROUTE",
        "ON_SCENE",
        "OFFLINE",
      ],
      default: "AVAILABLE",
    },

    currentSOS: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "report",
      default: null,
    },

    maxCapacity: {
      type: Number,
      default: 1,
      min: 1,
    },

    responseRadius: {
      type: Number,
      default: 20,
      min: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    lastLocationUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

rescueTeamSchema.index({
  currentLocation: "2dsphere",
});

const RescueTeam = mongoose.model("RescueTeam", rescueTeamSchema);
module.exports = RescueTeam;
