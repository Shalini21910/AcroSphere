import express from "express";
import {registerUser, loginUser} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js"; //  ensure you have this middleware imported
import User from "../models/user.js"; // needed to fetch user data

const authRouter=express.Router();
console.log("auth.routes.js loaded successfully");

//  Get current logged-in user (for /auth/me)
authRouter.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);

export default authRouter;