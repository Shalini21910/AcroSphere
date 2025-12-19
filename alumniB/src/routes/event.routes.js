import express from "express";
import Event from "../models/event.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ✅ Public - get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ event_date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Admin - create event
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      description,
      event_date,
      location,
      max_participants,
      image_url,
      application_link,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      event_date,          // Mongoose will cast from string to Date
      location,
      max_participants,
      image_url,
      application_link,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// ✅ Admin - delete event
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;
