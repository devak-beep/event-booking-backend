const express = require("express");
const router = express.Router();

const { registerUser, getUserById } = require("../controllers/user.controller");

// Register a new user
router.post("/register", registerUser);

// Get user by ID
router.get("/:id", getUserById);

module.exports = router;
