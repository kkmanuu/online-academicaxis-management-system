require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const path = require("path");
const examHandler = require("./websocket/examHandler");

const app = express();
const server = http.createServer(app);

// Initialize WebSocket handler
examHandler.initialize(server, "/ws/exams");

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", // For local development
      "https://academicsystem-g393.onrender.com" // For production on Render
    ],
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/teacher", require("./routes/teacher"));
app.use("/api/student", require("./routes/student"));
app.use("/api/exams", require("./routes/exam"));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/academicaxis";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Serve static files from React frontend build
app.use(express.static(path.join(__dirname, "../client/build")));

// Fallback to index.html for any non-API route (React Router support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
