// ---------------------------------------------
// 1. LOAD ENVIRONMENT VARIABLES (must be first)
// ---------------------------------------------
require("dotenv").config();

// ---------------------------------------------
// 2. IMPORT PACKAGES
// ---------------------------------------------
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route files
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");

// ---------------------------------------------
// 3. CONNECT TO MONGODB
// ---------------------------------------------
connectDB();

// ---------------------------------------------
// 4. CREATE THE EXPRESS APPLICATION
// ---------------------------------------------
const app = express();

// ---------------------------------------------
// 5. MIDDLEWARE - runs on every request, before routes
// ---------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json()); // parses JSON bodies into req.body

// ---------------------------------------------
// 6. ROUTES
// ---------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running",
  });
});

// POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
app.use("/api/auth", authRoutes);

// POST /api/tasks, GET /api/tasks, GET /api/tasks/stats,
// GET|PUT|DELETE /api/tasks/:id
app.use("/api/tasks", taskRoutes);

// POST /api/ai/chat
app.use("/api/ai", aiRoutes);

// ---------------------------------------------
// 7. 404 HANDLER - only runs if no route matched
// ---------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// ---------------------------------------------
// 8. GLOBAL ERROR HANDLER - Express knows this by its FOUR parameters
// ---------------------------------------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ---------------------------------------------
// 9. START THE SERVER
// ---------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});