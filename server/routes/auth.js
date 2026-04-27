const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'student' or 'teacher'" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role,
    });

    // Save user
    await user.save();
    console.log(`User registered successfully: ${email}`);

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Create token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Register error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already in use" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: `Validation error: ${error.message}` });
    }
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login attempt failed: User with email ${email} not found`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      console.log(`Login attempt failed: Blocked user ${email} attempted to login`);
      return res.status(403).json({
        message: "Your account has been blocked. Please contact the administrator.",
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login attempt failed: Invalid password for user ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check role (case-insensitive)
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      console.log(`Login attempt failed: Role mismatch for user ${email}. Expected: ${role}, Actual: ${user.role}`);
      return res.status(400).json({ message: `Invalid credentials for ${role} login` });
    }

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Create token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Return user data without password
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log(`User ${email} logged in successfully`);
    res.json({
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error during login" });
  }
});


// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user profile error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error while fetching user profile" });
  }
});

module.exports = router;