import express from "express";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import {
  createStory,
  getAllStories,
  deleteStory
} from "../controllers/story.controller.js";

const router = express.Router();

// Admin only routes
router.post("/", protect, adminOnly, createStory);
router.get("/", protect, getAllStories);
router.delete("/:id", protect, adminOnly, deleteStory);

export default router;
