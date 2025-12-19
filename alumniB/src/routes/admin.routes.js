import express from "express";
import { 
  getAllUsers, 
  deleteUser, 
  getAdminStats,
  getAllPosts, 
  deletePost,
  getPendingAlumni,
  approveAlumni,
  rejectAlumni,
  getAllJobs,
  verifyJob,
  rejectJob,
} from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
 

const router = express.Router();

router.get("/users", protect, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUser);

router.get("/stats", protect, adminOnly, getAdminStats);

router.get("/alumni/pending", protect, adminOnly, getPendingAlumni);
router.put("/alumni/approve/:id", protect, adminOnly, approveAlumni);
router.put("/alumni/reject/:id", protect, adminOnly, rejectAlumni);

router.get("/jobs", protect, getAllJobs);
router.put("/jobs/verify/:id", protect, adminOnly, verifyJob);
router.delete("/jobs/reject/:id", protect, adminOnly, rejectJob);

export default router;
