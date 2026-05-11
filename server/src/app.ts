import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import studentRoutes from "./routes/studentRoutes";

dotenv.config();

const app = express();
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api", studentRoutes);

export const connectToDatabase = async () => {
  if (!mongoUri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGODB_URI in server/.env.",
    );
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB Connected");
};

export default app;
