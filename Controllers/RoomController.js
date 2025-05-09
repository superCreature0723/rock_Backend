// controllers/RoomController.js
const Room = require("../models/Room");

// Create a new room
exports.createRoom = async (req, res) => {

 const { name, status, maxPlayers, currentPlayers, playerName } = req.body; 

  if (!playerName) {
    return res.status(400).json({ error: "Player name is required" }); // Check if playerName is provided
  }

  const newRoom = new Room({
    name,
    players: [
      {
        id: 1,
        name: playerName,
        userSelect: "none",
        score: 0,
      },
    ],
    maxPlayers,
    currentPlayers: 1,
    status: "waiting",
  });
  
  console.log("Raptor Here:", newRoom);

  try {
    await newRoom.save();
    res.status(200).json({ roomId: newRoom._id });
  } catch (err) {
    res.status(500).json({ error: "Error creating room" });
  }
};

// Get all available rooms
exports.getRooms = async (req, res) => {
  const rooms = await Room.find({ status: "waiting" });
  res.status(200).json({ rooms });
};

// Join a room
exports.joinRoom = async (req, res) => {
  const { roomId, playerName } = req.body;

  const room = await Room.findById(roomId);
  if (
    !room ||
    room.status !== "waiting" ||
    room.currentPlayers >= room.maxPlayers
  ) {
    return res.status(400).json({ error: "Room is full or not available" });
  }

  room.players.push({ name: playerName });
  room.currentPlayers += 1;
  if (room.currentPlayers === room.maxPlayers) {
    room.status = "playing"; // Game can start
  }

  await room.save();
  res.status(200).json({ message: "Player joined the room", roomId: room._id });
};

// Make a move
exports.makeMove = async (req, res) => {
  const { roomId, playerName, move } = req.body;

  const room = await Room.findById(roomId);
  if (!room || room.status !== "playing") {
    return res.status(400).json({ error: "Game not in progress" });
  }

  // Find the player in the room
  const player = room.players.find((p) => p.name === playerName);
  if (!player) {
    return res.status(400).json({ error: "Player not found" });
  }

  player.move = move;

  // Check if both players have made their move
  if (room.players.every((p) => p.move !== "none")) {
    const result = determineWinner(room.players[0], room.players[1]);
    room.status = "finished";
    room.winner = result;
    room.players.forEach((p) => {
      if (p.move === result) {
        p.score += 1;
      }
    });
  }

  await room.save();
  res.status(200).json({ message: "Move made", room });
};

// Determine winner based on moves
const determineWinner = (player1, player2) => {
  if (player1.move === player2.move) return "tie";

  if (
    (player1.move === "rock" && player2.move === "scissors") ||
    (player1.move === "paper" && player2.move === "rock") ||
    (player1.move === "scissors" && player2.move === "paper")
  ) {
    return player1.name;
  }
  return player2.name;
};
