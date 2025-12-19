import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    story: {
      type: String,
      required: true,
      trim:true,
    },
    achievement: {
      type: String,
      trim:true,
    },
    image_url:{
      type:String,
      trim:true,
    },
    author:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      required:true,
    },
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);
export default Story;
