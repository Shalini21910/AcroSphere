import Profile from "../models/profile.js";
import User from "../models/user.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
const DEFAULT_PHOTO = Profile.schema.path("photo").defaultValue;

// Get current user's profile 
 
export const getMyProfile = async (req, res) => {
  try {
    
    const profile = await Profile.findOne({ user: req.user._id }).populate("user", "name email");

    if (!profile) {
      return res.json({
        full_name: req.user.name,
        email: req.user.email,
        photo:DEFAULT_PHOTO,
      });
    }

    res.json({
      full_name: profile.user.name,
      email: profile.user.email,
      graduation_year: profile.graduation_year,
      department: profile.department,
      company: profile.company,
      designation: profile.currentPosition,
      bio: profile.bio,
      location: profile.location,
      linkedin: profile.linkedin,
      github: profile.github,
      photo: profile.photo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const upsertProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      full_name,
      graduation_year,
      department,
      company,
      designation,       
      bio,
      location,
      linkedin,      
      github
    } = req.body;
    
    let photoUrl;
    if(req.file){
     const uploadImage = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "alumni_uploads" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });

  photoUrl = uploadImage.secure_url;
 }
    
    // update user name if provided
    if (full_name) {
      await User.findByIdAndUpdate(userId, { name: full_name });
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        graduation_year,
        department,
        company,
        currentPosition: designation,  
        bio,
        location,
        linkedin,        
        github,
        ...(photoUrl && {photo:photoUrl}),
      },
      { upsert: true, new: true }
    );

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .lean();
     
    // return raw profiles
     res.json(profiles);
  } catch (err) {
    console.error("getAllProfiles error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
