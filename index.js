const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { resolve } = require("path");

// Load environment variables
dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(express.static("static")); // Serve static files (CSS, JS, images)
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error: ", err));

// User Model
const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(resolve(__dirname, "pages/index.html"));
});

// 🔹 Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 2️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4️⃣ Send success response
    res.status(200).json({ message: "Login successful", userId: user._id });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
