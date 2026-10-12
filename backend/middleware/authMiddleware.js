const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware sits between the request and the route handler.
// next() = "all good, continue". Not calling it = request stops here.
const protect = async (req, res, next) => {
  let token;

  // Frontend sends: Authorization: Bearer eyJhbGciOi...
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Split "Bearer <token>" on the space, take part [1]
      token = req.headers.authorization.split(" ")[1];

      // Verify the signature. Edited or expired tokens THROW here.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the fresh user, so a deleted user can't reuse an old token
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user no longer exists",
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: "Not authorized, no token provided",
  });
};

module.exports = { protect };