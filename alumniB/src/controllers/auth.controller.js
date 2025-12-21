import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, full_name, email, password, role
      ,dob, fatherName, motherName, scholarNo, pendingAlumni,
     } = req.body;

    const userName = name || full_name; // allows either frontend naming

    // Check if all fields are provided
    if (!userName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const finalRole = pendingAlumni ? "student" : role || "student";
    // Create new user 
    const user = await User.create({ name: userName, email, password, role:finalRole,
      pendingAlumni: pendingAlumni === true,
      dob: pendingAlumni ? dob : undefined,
      fatherName: pendingAlumni ? fatherName : undefined,
      motherName: pendingAlumni ? motherName : undefined,
      scholarNo: pendingAlumni ? scholarNo : undefined,
     });

    // Respond with created user data
    return res.status(201).json({
      message: pendingAlumni
      ? "Registration successful. Pending admin verification."
      :"User registered successfully",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        pendingAlumni: user.pendingAlumni,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }

  // Pending alumni allowed (treated as student)
  return res.status(200).json({
    message: "Login successful",
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,             // student or alumni
      pendingAlumni: user.pendingAlumni,
    },
  });
} 