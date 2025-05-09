// src/models/Room.js
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  playerId: String,
  name: String,
  move: { type: String, default: "none" }, // Player's move (rock, paper, scissors)
  score: { type: Number, default: 0 }, // Player's score
});

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, default: "waiting" }, // waiting, playing, finished
  maxPlayers: { type: Number, default: 2 },
  currentPlayers: { type: Number, default: 1 },
  winner: { type: String, default: "" }, // winner of the round
  players: [playerSchema],
  round: { type: Number, default: 1 },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
