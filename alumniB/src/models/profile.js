import mongoose from "mongoose";

const DEFAULT_PHOTO="https://res.cloudinary.com/dddqt6qjf/image/upload/v1765099637/9815472_tkoi09.png";
const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bio: String,
    graduation_year: Number,        
    department: String,   
    linkedin: String,
    github: String,
    currentPosition: String,
    company: String,
    location: String,
    photo: {type:String, default:DEFAULT_PHOTO}, // URL or path
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
