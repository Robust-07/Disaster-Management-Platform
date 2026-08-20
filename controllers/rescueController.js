const RescueTeam = require("../models/RescueTeam");

// CREATE RESCUE TEAM
const createRescueTeam = async (req, res) => {
  try {
    const {
      name,
      organization,
      teamType,
      members,
      capabilities,
      equipment,
      latitude,
      longitude,
      availability,
      currentStatus,
      maxCapacity,
      responseRadius,
      rating,
    } = req.body;

    const team = await RescueTeam.create({
      name,
      organization,
      teamType,
      members,
      capabilities,
      equipment,
      latitude,
      longitude,

      currentLocation: {
        type: "Point",
        coordinates: [longitude, latitude],
      },

      availability,
      currentStatus,
      maxCapacity,
      responseRadius,
      rating,
      lastLocationUpdate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Rescue team created successfully",
      team,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ALL RESCUE TEAMS
const getAllRescueTeams = async (req, res) => {
  try {
    const teams = await RescueTeam.find();

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ONE RESCUE TEAM
const getRescueTeamById = async (req, res) => {
  try {
    const team = await RescueTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found",
      });
    }

    res.status(200).json({
      success: true,
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE RESCUE TEAM
const updateRescueTeam = async (req, res) => {
  try {
    const team = await RescueTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found",
      });
    }

    Object.assign(team, req.body);

    if (
      req.body.latitude !== undefined ||
      req.body.longitude !== undefined
    ) {
      const latitude =
        req.body.latitude !== undefined
          ? req.body.latitude
          : team.latitude;

      const longitude =
        req.body.longitude !== undefined
          ? req.body.longitude
          : team.longitude;

      team.latitude = latitude;
      team.longitude = longitude;

      team.currentLocation = {
        type: "Point",
        coordinates: [longitude, latitude],
      };

      team.lastLocationUpdate = new Date();
    }

    await team.save();

    res.status(200).json({
      success: true,
      message: "Rescue team updated successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE RESCUE TEAM
const deleteRescueTeam = async (req, res) => {
  try {
    const team = await RescueTeam.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Rescue team deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// UPDATE LOCATION
const updateTeamLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const team = await RescueTeam.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Rescue team not found",
      });
    }

    team.latitude = latitude;
    team.longitude = longitude;

    team.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };

    team.lastLocationUpdate = new Date();

    await team.save();

    res.status(200).json({
      success: true,
      message: "Team location updated successfully",
      team,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// FIND NEARBY TEAMS
const getNearbyTeams = async (req, res) => {
  try {
    const { latitude, longitude, radius = 20 } = req.query;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const teams = await RescueTeam.find({
      availability: true,
      currentStatus: "AVAILABLE",

      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              Number(longitude),
              Number(latitude),
            ],
          },

          $maxDistance: Number(radius) * 1000,
        },
      },
    });

    res.status(200).json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  createRescueTeam,
  getAllRescueTeams,
  getRescueTeamById,
  updateRescueTeam,
  deleteRescueTeam,
  updateTeamLocation,
  getNearbyTeams,
};
