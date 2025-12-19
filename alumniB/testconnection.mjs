import mongoose from "mongoose";

const uri = "mongodb+srv://sakura_user:KicLzOsSjFkO2zkm@cluster-alumni.tloebgp.mongodb.net/?appName=Cluster-alumni";

try {
  await mongoose.connect(uri);
  console.log(" MongoDB connected!");
} catch (err) {
  console.error(" Connection error:", err);
}
