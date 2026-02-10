import mongoose from "mongoose";
import { env } from "../config/env";

export async function initMongo(): Promise<typeof mongoose> {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not set in environment variables");
  }

  try {
    await mongoose.connect(env.mongoUri);
    // Optional: log connected DB name
    const dbName = mongoose.connection.name;
    console.log(`MongoDB connected to database: ${dbName}`);
    return mongoose;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
}

