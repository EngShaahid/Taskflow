const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public - anyone can call these
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private - "protect" runs FIRST.
// Invalid token means getMe never executes.
router.get("/me", protect, getMe);

module.exports = router;