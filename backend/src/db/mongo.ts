import mongoose from "mongoose";
import { env } from "../config/env";

export async function initMongo(): Promise<typeof mongoose> {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  try {
    const connection = await mongoose.connect(env.mongoUri);
    console.log(`✅ MongoDB connected to: ${connection.connection.name}`);
    return mongoose;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1); // Optional: Exit process if DB connection fails
  }
}