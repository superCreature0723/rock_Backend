const express = require("express");
const Room = require("../models/Room");
const router = express.Router();

// POST: Create a new room
router.post("/create-room", async (req, res) => {
  const { name, status, maxPlayers, currentPlayers, playerName } = req.body;

  // Create a new room with the provided data
  const newRoom = new Room({
    name,
    status,
    maxPlayers,
    currentPlayers,
    players: [
      {
        id: 1,
        name: playerName,
        userSelect: "none",
        score: 0,
      },
    ],
  });

  try {
    // Save the room data to the database
    await newRoom.save();
    res.status(200).json(newRoom);
  } catch (err) {
    console.error("Error saving room:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.get("/get-rooms", async (req, res) => {
  console.log("Fetching rooms...");
  try {
    const rooms = await Room.find();
    res.status(200).json({ rooms }); // Send rooms data as JSON
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

module.exports = router;
