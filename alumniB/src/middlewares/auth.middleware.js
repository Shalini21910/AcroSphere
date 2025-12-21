import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      return next(); // ✅ IMPORTANT
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "No token, authorization denied" });
};

//check if user is admin
export const adminOnly=(req,res,next)=>{
    if(req.user && req.user.role ==="admin"){
        next();
    }else{
        res.status(403).json({message:"access denied. admins only."});
    }
};

export const alumniOnly = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "alumni" &&
    req.user.pendingAlumni === false
  ) {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Verified alumni only.",
  });
};

//for later!
/*
export const studentOnly = (req, res, next) => {
  if (req.user && req.user.role === "student") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Students only.",
  });
};*/