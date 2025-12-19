import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    event_date: { type: Date, required: true },
    location: { type: String, required: true },
    image_url: { type: String },               
    max_participants: { type: Number },        
    application_link: { type: String },        

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
