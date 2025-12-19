import User from "../models/user.js";
import Post from "../models/post.js";
import Event from "../models/event.js";
import Job from "../models/job.js";

//Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Delete a user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("createdBy", "name email role");
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//Admin overview dashboard data
export const getAdminStats = async (req, res) => {
  try {
    const [userCount, postCount, eventCount, jobCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Event.countDocuments(),
      Job.countDocuments(),
    ]);

    res.json({
      users: userCount,
      posts: postCount,
      events: eventCount,
      jobs: jobCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getPendingAlumni = async (req, res) => {
  try {
    const users = await User.find({
      pendingAlumni: true,
      role: "student",
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error("Error fetching pending alumni:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const approveAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.pendingAlumni) {
      return res.status(404).json({ message: "Pending alumni not found" });
    }

    user.role = "alumni";
    user.pendingAlumni = false;
    await user.save();

    res.json({ message: "Alumni verified successfully" });
  } catch (error) {
    console.error("Error approving alumni:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const rejectAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.pendingAlumni) {
      return res.status(404).json({ message: "Pending alumni not found" });
    }

    user.pendingAlumni = false;
    user.dob = undefined;
    user.fatherName = undefined;
    user.motherName = undefined;
    user.scholarNo = undefined;

    await user.save();

    res.json({ message: "Alumni request rejected" });
  } catch (error) {
    console.error("Error rejecting alumni:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all jobs (admin – includes pending + verified)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify job (admin)
export const verifyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.is_verified = true;
    await job.save();

    res.json({ message: "Job verified successfully" });
  } catch (error) {
    console.error("Error verifying job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject job (admin – delete)
export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job rejected and deleted" });
  } catch (error) {
    console.error("Error rejecting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};
