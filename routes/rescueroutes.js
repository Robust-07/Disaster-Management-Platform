const express = require("express");

const router = express.Router();

const {
  createRescueTeam,
  getAllRescueTeams,
  getRescueTeamById,
  updateRescueTeam,
  deleteRescueTeam,
  updateTeamLocation,
  getNearbyTeams,
} = require("../controllers/rescueController");


// Create rescue team
router.post("/", createRescueTeam);

// Get all rescue teams
router.get("/", getAllRescueTeams);

// Get nearby available teams
router.get("/nearby", getNearbyTeams);

// Get one rescue team
router.get("/:id", getRescueTeamById);

// Update rescue team
router.patch("/:id", updateRescueTeam);

// Update location
router.patch("/:id/location", updateTeamLocation);

// Delete rescue team
router.delete("/:id", deleteRescueTeam);


module.exports = router;
