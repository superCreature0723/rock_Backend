// routes/roomRoutes.js
const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/RoomController");

// Create a room
router.post("/create-room", RoomController.createRoom);

// Get all available rooms
router.get("/get-rooms", RoomController.getRooms);

// Join a room
router.post("/join-room", RoomController.joinRoom);

// Make a move
router.post("/make-move", RoomController.makeMove);

module.exports = router;
