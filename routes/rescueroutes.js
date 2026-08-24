const express = require("express");
const router = express.Router();

const {createRescueTeam, getAllRescueTeams, getRescueTeamById, updateRescueTeam, deleteRescueTeam, updateTeamLocation, getNearbyTeams} = require("../controllers/rescueController");

router.post("/", createRescueTeam);
router.get("/", getAllRescueTeams);
router.get("/nearby", getNearbyTeams);
router.get("/:id", getRescueTeamById);
router.patch("/:id", updateRescueTeam);
router.patch("/:id/location", updateTeamLocation);
router.delete("/:id", deleteRescueTeam);

module.exports = router;
