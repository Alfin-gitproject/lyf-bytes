
// src/lib/db/connection.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://alfinreji10:<Password>@expense-tracker.ei7p0d7.mongodb.net/lyfbytes?retryWrites=true&w=majority&appName=lyfbytes";

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env");
}

let isConnected = false;

export default async function dbConnect() {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    console.log("Attempting to connect to MongoDB with URI:", MONGODB_URI.replace(/:.*@/, ":****@"));
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
