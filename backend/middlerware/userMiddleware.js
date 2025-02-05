const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  try {
    console.log("Headers:", req.headers);
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No Authorization header found");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
      console.log("No token found in Authorization header");
      return res.status(401).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ message: "Invalid token" });
      }
      
      console.log("Decoded token:", decoded);
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Middleware error:", error);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

module.exports = { verifyToken };
