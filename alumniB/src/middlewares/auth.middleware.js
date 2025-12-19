import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect=async(req, res, next)=>{
    let token;

    //check for token in Authorization header
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try{
            //extract token
            token=req.headers.authorization.split(" ")[1];
            
            //verify token
            const decoded=jwt.verify(token, process.env.JWT_SECRET);

            //attach user to request (excluding password)
            req.user=await User.findById(decoded.userId).select("-password");

             if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

            next();
        }catch(error){
            console.error("Auth error:", error);
            res.status(401).json({message:"Not authorized, token failed"});
        }
    }
    if(!token){
        res.status(401).json({message:"No token, authorization denied"});
    }
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