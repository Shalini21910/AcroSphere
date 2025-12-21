// routes/stats.routes.js
import express from "express";
import User from "../models/user.js";
import Event from "../models/event.js";
import Job from "../models/job.js";
import Donation from "../models/donation.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/dashboard",protect, async (req, res) => {
 try {
    const [
      totalAlumni,
      upcomingEvents,
      activeJobs,
      donationDrives,
    ] = await Promise.all([
      User.countDocuments({ role: "alumni" }),
      Event.countDocuments(),
      Job.countDocuments({ is_verified: true }),
      Donation.countDocuments(),
    ]);

    res.json({
      totalAlumni,
      upcomingEvents,
      activeJobs,
      donations: donationDrives,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});
export default router;