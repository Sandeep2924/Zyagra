const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { ObjectId } = require('mongodb');

/**
 * @route   POST /register
 * @desc    Registers a new member
 */
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, phone, password, address, city, postalCode } = req.body;

        // 1. Basic Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // 2. Check for existing member
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "A member with this email already exists." });
        }

        // 3. Create record (Address grouped for the model)
        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            phone,
            password, // Password hashing should be handled in your User model middleware
            shippingAddress: { address, city, postalCode }
        });

        await newUser.save();
        res.status(201).json({ message: "Welcome to Zyagra! You can now log in." });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
});

/**
 * @route   POST /login
 * @desc    Authenticates a member and returns a token
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // 2. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        // 3. Create JWT Token
        // Ensure JWT_SECRET is set in your deployment environment variables
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message: "Login successful!",
            token,
            id: user._id
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

/**
 * @route   GET /userdetails
 * @desc    Get profile data for a specific user
 */
router.get("/userdetails", async (req, res) => {
    try {
        const { id } = req.query;

        if (!id || !ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Valid User ID is required." });
        }

        const user = await User.findById(id).select("-password"); // Exclude password from results

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({
            fullName: user.fullName,
            email: user.email,
            shippingAddress: user.shippingAddress,
            phone: user.phone
        });

    } catch (error) {
        console.error("Fetch User Error:", error);
        res.status(500).json({ message: "Error retrieving user details." });
    }
});

module.exports = router;