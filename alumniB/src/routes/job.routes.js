import express from "express";
import Job from "../models/job.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public - get all verified jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({ is_verified: true }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected - alumni or admin can post a new job
router.post("/", protect, async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user._id,
      is_verified: req.user.role === "admin" ? true : false, // auto-verify if admin
    });
    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Failed to create job" });
  }
});

export default router;
