const User = require("../models/User");
const jwt = require("jsonwebtoken");

// HELPER: create a signed token containing the user's id
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // payload - data inside the token
    process.env.JWT_SECRET,   // secret key, so nobody can forge it
    { expiresIn: "7d" }       // expires after 7 days
  );
};

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Never trust the client - validate first
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email and password",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    // Password is hashed automatically by the pre-save hook
    const user = await User.create({ name, email, password });

    // Send a token too, so the frontend can log them in immediately.
    // We NEVER send the password back.
    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Login an existing user
// @route  POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Explicitly include the password, which select:false hides
    const user = await User.findOne({ email }).select("+password");

    // SECURITY: identical message for "no such email" and "wrong password",
    // so an attacker cannot discover which emails are registered.
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get the currently logged-in user
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  // req.user was attached by the middleware.
  // Reaching this line means the token was valid.
  res.status(200).json({ success: true, user: req.user });
};

module.exports = { registerUser, loginUser, getMe };