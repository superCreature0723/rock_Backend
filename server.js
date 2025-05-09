const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/roomRoutes");


dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // To parse JSON body
app.use(cors({ origin: "http://localhost:3000" }));

app.use("/api/auth", authRoutes);

app.use("/api", roomRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
