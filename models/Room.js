// src/models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, default: "Waiting" },
  maxPlayers: { type: Number, required: true },
  currentPlayers: { type: Number, default: 1 },
  players: [
    {
      id: { type: Number },
      name: { type: String },
      userSelect: { type: String, default: "none" },
      score: { type: Number, default: 0 },
    },
  ],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
