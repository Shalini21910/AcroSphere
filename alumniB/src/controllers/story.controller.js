import Story from "../models/story.js";

export const createStory = async (req, res) => {
  try {
    const { title, story, achievement, image_url} = req.body;

    if(!title || !story){
    return res
    .status(400)
    .json({message:"Title and story are required"});
    }

    const newStory=new Story({
    title,
    story,
    achievement,
    image_url,
    author: req.user._id,
    });
    
    await newStory.save();
    res
    .status(201)
    .json({ message: "Story created successfully", story: newStory });
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ message: "Failed to create story" });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find()
      .populate("author", "full_name email")
      .sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Failed to fetch stories" });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    await Story.findByIdAndDelete(id);
    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ message: "Failed to delete story" });
  }
};
