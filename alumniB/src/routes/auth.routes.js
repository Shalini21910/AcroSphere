import express from "express";
import {registerUser, loginUser} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js"; //  ensure you have this middleware imported
import User from "../models/user.js"; // needed to fetch user data

const authRouter=express.Router();
console.log("auth.routes.js loaded successfully");

//  Get current logged-in user (for /auth/me)
authRouter.get("/me", protect, async (req, res) => {
  try {
    // req.user is already populated by protect middleware
    res.json(req.user);
  } catch (error) {
    console.error("Auth /me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);

export default authRouter;