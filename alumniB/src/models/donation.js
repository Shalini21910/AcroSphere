import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    description: {type: String, required:true},
    goal_amount: {type: Number, required: true },
    current_amount: {type: Number, default: 0 },
    image_url: {type: String},
    qr_code_url: {type: String},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
