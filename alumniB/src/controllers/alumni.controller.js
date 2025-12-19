import User from "../models/user.js";
import Profile from "../models/profile.js";

export const getAlumni = async (req, res) => {
  try {
    //Get all users who are alumni
    const alumniUsers = await User.find({ role: "alumni" })
      .select("name email role")
      .lean();

    const alumniIds = alumniUsers.map(u => u._id);

    //Get all profiles that belong to these users
    const profiles = await Profile.find({
      user: { $in: alumniIds }
    }).lean();

    //Merge user info + profile info
    const result = alumniUsers.map(user => {
      const p = profiles.find(pr => String(pr.user) === String(user._id));
      
      return {
        _id: user._id,              
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },

        // Profile fields if available, otherwise blank
        currentPosition: p?.currentPosition || "",
        company: p?.company || "",
        department: p?.department || "",
        location: p?.location || "",
        graduation_year: p?.graduation_year || null,
        bio: p?.bio || "",
        linkedin: p?.linkedin || "",
        github: p?.github || "",
        photo: p?.photo,
      };
    });

    res.json(result);

  } catch (err) {
    console.error("Get Alumni Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
