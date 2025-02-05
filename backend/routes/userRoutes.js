const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const User = require("../models/userModels");
const { registerUser, loginUser } = require("../controllers/userControllers");

// Register a new user
router.post("/register", registerUser);
// Login a user
router.post("/login", loginUser);

module.exports = router;
