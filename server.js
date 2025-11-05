import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cloudinary from "./utils/cloudinary.js";
import connectDB from "./config/db.js";

dotenv.config(); // Load environment variables
connectDB();
const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server + Cloudinary Connected Successfully!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server is running on port ${PORT}`);
});
