import express from "express";
import { getAlumni } from "../controllers/alumni.controller.js";

const router = express.Router();

// Public route
router.get("/", getAlumni);

export default router;
