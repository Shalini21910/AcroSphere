import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    application_link: { type: String },
    is_verified: { type: Boolean, default: false }, // verified by admin
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // alumni/admin
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
