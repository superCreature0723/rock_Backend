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

router.post("/join-room", async (req, res) => {
  const { roomId, playerName } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (room.currentPlayers < room.maxPlayers) {
      room.players.push({
        id: room.currentPlayers + 1,
        name: playerName,
        score: 0,
        choice: "none",
      });
      room.currentPlayers += 1;
      if (room.currentPlayers === room.maxPlayers) {
        room.status = "in_progress"; // Change status to in_progress when two players join
      }
      await room.save();
      res.status(200).json({ message: "Joined room", room });
    } else {
      res.status(400).json({ error: "Room is full" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error joining room" });
  }
});

// API to make a move
router.post("/make-move", async (req, res) => {
  const { roomId, playerId, choice } = req.body;

  try {
    const room = await Room.findById(roomId);
    const player = room.players.find((p) => p.id === playerId);

    if (player) {
      player.choice = choice; // Update the player's choice
      await room.save();

      // Check if both players have made a choice
      const allPlayersChosen = room.players.every((p) => p.choice !== "none");
      if (allPlayersChosen) {
        // Determine the winner
        const winner = determineWinner(room.players);
        room.status = "finished";
        room.players.forEach((p) => {
          if (p.name === winner) p.score += 1; // Update score for the winner
        });
        await room.save();
        res.status(200).json({ winner });
      } else {
        res.status(200).json({ message: "Waiting for the other player" });
      }
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error making move" });
  }
});

// Determine the winner based on choices
function determineWinner(players) {
  const [player1, player2] = players;
  if (player1.choice === player2.choice) return "Draw";

  if (
    (player1.choice === "rock" && player2.choice === "scissors") ||
    (player1.choice === "scissors" && player2.choice === "paper") ||
    (player1.choice === "paper" && player2.choice === "rock")
  ) {
    return player1.name;
  } else {
    return player2.name;
  }
}

module.exports = router;
