import express from "express";
import { protect } from "./src/middleware/authMiddleware.js";


import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authroutes.js";

dotenv.config(); // Must be **before** using process.env

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/api/profile", protect, (req, res) => {
  res.json(req.user);
});

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));