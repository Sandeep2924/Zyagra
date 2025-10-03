const express = require("express");
const router = express.Router();
const User = require("../models/userModel"); // Gets the definition of a "Member"
const bcrypt = require("bcryptjs"); // We need the password scrambler to check passwords

// Rule for: "Signing Up a New Member"
router.post("/register", async (req, res) => {
  // 1. Look at the application form (the data sent from the SignUpPage)
  const { fullName, email, password } = req.body;

  // 2. Check if a member with this email is already on the list
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "A member with this email already exists." });
  }

  // 3. If they are new, create a new member record
  const newUser = new User({ fullName, email, password });
  await newUser.save(); // When we save, the password gets scrambled automatically!

  // 4. Send back a success message
  res.status(201).json({ message: "Welcome to the club! You can now log in." });
});

// Rule for: "Letting an Existing Member In"
router.post("/login", async (req, res) => {
  // 1. Get the email and password they provided
  const { email, password } = req.body;

  // 2. Find the member on our list by their email
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ message: "Sorry, we don't recognize that email." });
  }

  // 3. Check if the password they gave matches the scrambled one on our list
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect password." });
  }

  // 4. If everything is correct, let them in!
  res.status(200).json({ message: "Login successful! Welcome back." });
});

module.exports = router;
