// controllers/RoomController.js
const Room = require("../models/Room");
const User = require("../models/User");

// Create a new room
exports.createRoom = async (req, res) => {
  let { name, maxPlayers, playerName } = req.body;

  if (!playerName) {
    return res.status(400).json({ error: "Player name is required" });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Room name cannot be empty" });
  }

  name = name.trim();

  try {
    if (!name) {
      return res.status(400).json({ error: "Room name cannot be empty" });
    }

    const existingRoom = await Room.findOne({
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existingRoom) {
      return res
        .status(400)
        .json({ error: "Room with this name already exists" });
    }
    // Find the user by playerName (you could also use email, or userId)
    const user = await User.findOne({ username: playerName });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const newRoom = new Room({
      name,
      status: "waiting",
      maxPlayers,
      currentPlayers: 1,
      players: [{ userId: user._id, name: playerName, move: "none", score: 0 }],
    });

    await newRoom.save();
    res.status(200).json(newRoom); // Send the room data as the response
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Room with this name already exists" });
    }
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

  try {
    // Find the user by playerName
    const user = await User.findOne({ username: playerName });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Find the room by roomId
    const room = await Room.findOne({ name: roomId });
    if (
      !room ||
      room.status !== "waiting" ||
      room.currentPlayers >= room.maxPlayers
    ) {
      return res.status(400).json({ error: "Room is full or not available" });
    }

    // Add the player to the room
    room.players.push({
      userId: user._id,
      name: playerName,
      move: "none",
      score: 0,
    });
    room.currentPlayers += 1;

    // If the room is full, update the room status to "playing"
    if (room.currentPlayers === room.maxPlayers) {
      room.status = "playing";
    }

    await room.save();
    res
      .status(200)
      .json({ message: "Player joined the room", roomId: room._id });
  } catch (err) {
    res.status(500).json({ error: "Error joining room" });
  }
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
