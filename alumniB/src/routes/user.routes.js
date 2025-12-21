import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import User from "../models/user.js";

const router = express.Router();

// Get currently logged-in user
router.get("/me", protect, async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Public - get all alumni
router.get("/alumni", async (req, res) => {
  try {
    const alumni = await User.find({ role: "alumni" }).select("-password");
    res.json(alumni);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
