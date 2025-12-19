import express from "express";
import Donation from "../models/donation.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ Public - get all donations
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ message: "Failed to fetch donations" });
  }
});

// ✅ Admin only - create a donation campaign
router.post("/", protect, adminOnly, async (req, res) => {
  console.log("Create donation body:", req.body);
  try {
    const { title, description, goal_amount, image_url, qr_code_url } = req.body;

    if (!title || !description || goal_amount == null) {
      return res.status(400).json({ message: "Title, description and goal amount are required" });
    }

    const donation = await Donation.create({
      title,
      description,
      goal_amount,
      current_amount: 0,
      image_url,
      qr_code_url,
      createdBy: req.user._id,
    });
console.log("Creating donation with:", { title, description, goal_amount, image_url, qr_code_url });

    res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({ message: "Failed to create donation" });
  }
});

// ✅ Admin only - delete a donation campaign
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Error deleting donation:", error);
    res.status(500).json({ message: "Failed to delete donation" });
  }
});

export default router;
