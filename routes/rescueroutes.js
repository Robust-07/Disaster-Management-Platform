const express = require("express");
const router = express.Router();

const {createRescueTeam, getAllRescueTeams, getRescueTeamById, updateRescueTeam, deleteRescueTeam, updateTeamLocation, getNearbyTeams, getMyAssignments, linkUserToTeam} = require("../controllers/rescueController");
const {protect, authorize} = require('../middleware/authmiddleware.js');

router.post("/", createRescueTeam);
router.get("/", getAllRescueTeams);
router.get('/nearby', protect, authorize('authority'), getNearbyTeams);
router.get('/my-assignments', protect, authorize('rescuer'), getMyAssignments);
router.get("/:id", getRescueTeamById);
router.patch("/:id", updateRescueTeam);
router.patch("/:id/location", updateTeamLocation);
router.delete("/:id", deleteRescueTeam);
router.patch('/:id/link-user', protect, authorize('authority'), linkUserToTeam);

module.exports = router;
