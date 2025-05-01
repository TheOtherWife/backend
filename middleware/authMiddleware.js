const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("got here");
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the userId to the request object
    req.user = { userId: decoded.userId };
    console.log(req.user);

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const vendorAuthMiddleware = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the vendorId to the request object
    req.vendor = { vendorId: decoded.vendorId };

    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware, vendorAuthMiddleware };
