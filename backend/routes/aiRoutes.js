const express = require("express");
const router = express.Router();

const { chatWithAI } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Protected: only logged-in users can use the AI.
// This stops strangers burning through your API quota.
router.post("/chat", protect, chatWithAI);

module.exports = router;