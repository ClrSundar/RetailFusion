import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    console.log("🔌 Connecting to MongoDB...");
    const uri = process.env.MONGODB_URI!;
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });
    isConnected = true;
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
  } catch (err: any) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};
