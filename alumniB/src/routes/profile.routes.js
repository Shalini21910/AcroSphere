// routes/profileRoutes.js
import express from "express";
import { getMyProfile, upsertProfile, getAllProfiles } from "../controllers/profile.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = express.Router();

// multer with memory storage for Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// current user's profile
router.get("/", protect, getMyProfile);

// update/create profile, with optional photo
router.put("/", protect, upload.single("photo"), upsertProfile);

// public directory
router.get("/all", getAllProfiles);

export default router;
