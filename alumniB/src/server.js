import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import authRouter from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import postRoutes from "./routes/post.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import storyRoutes from "./routes/story.routes.js";
import eventRoutes from "./routes/event.routes.js";
import jobRoutes from "./routes/job.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import userRoutes from "./routes/user.routes.js";
import alumniRoutes from "./routes/alumni.routes.js";

const app=express();

//  Allow requests from your frontend
app.use(cors({
  origin: "http://localhost:8080",  
  credentials: true                 
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Backend connected successfully!" });
});


app.use(morgan("dev"));

//mount routes
app.use("/api/auth",authRouter);
app.use("/api/profile",profileRoutes)
app.use("/api/posts",postRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/upload",uploadRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alumni", alumniRoutes);


//const PORT = process.env.PORT || 5000;
//mongodb connection
mongoose
.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB connected");
    app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
})
.catch((err)=>console.error("MongoDB error:",err));


//Routes test
app.get("/",(req,res)=>{
    res.send("Alumni Network API is running...");
});

const PORT = process.env.PORT || 5000;



