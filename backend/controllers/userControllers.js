const User = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { usn, password, name, email, branch, semester } = req.body;
  
  if (!usn || !password) {
    return res.status(400).json({
      success: false,
      message: "USN and password are required"
    });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ usn: usn.toUpperCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash the password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with all fields
    const user = new User({
      usn: usn.toUpperCase(),
      password: hashedPassword,
      name,
      email,
      branch,
      semester,
      createdAt: new Date()
    });

    await user.save();

    // Generate a JWT token
    const token = jwt.sign(
      { 
        _id: user._id,
        usn: user.usn,
        name: user.name,
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send the response with user data and token
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        usn: user.usn,
        email: user.email,
        name: user.name,
        semester: user.semester,
        branch: user.branch,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "USN already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: "Error registering user. Please try again."
    });
  }
};

const loginUser = async (req, res) => {
  const { usn, password } = req.body;

  if (!usn || !password) {
    return res.status(400).json({
      success: false,
      message: "USN and password are required"
    });
  }

  try {
    // Convert USN to uppercase for case-insensitive comparison
    const normalizedUsn = usn.toUpperCase();
    
    // Find the user
    const user = await User.findOne({ usn: normalizedUsn }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { 
        _id: user._id,
        usn: user.usn,
        name: user.name,
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        usn: user.usn,
        email: user.email,
        name: user.name,
        semester: user.semester,
        branch: user.branch,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in. Please try again."
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
