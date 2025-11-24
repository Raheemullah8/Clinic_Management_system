import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "./utils/cloudinary.js";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patient.js";
import doctorsRoutes from "./routes/doctor.js";
import admniRoutes from "./routes/admin.js";
import appointmentsRoutes from "./routes/appointments.js";
import medicalRecordsRoutes from "./routes/medcialRecords.js";

dotenv.config();

const app = express();

// 🟢 Connect DB only ONCE (required for Vercel)
connectDB();

// 🟢 Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🟢 Trust proxy
app.set("trust proxy", 1);

// 🟢 CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// 🟢 Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/doctors", doctorsRoutes);
app.use("/api/v1/admin", admniRoutes);
app.use("/api/v1/appointments", appointmentsRoutes);
app.use("/api/v1/medcial", medicalRecordsRoutes);

// 🟢 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🟢 Health Route
app.get("/", (req, res) => {
  res.send("🚀 Server + Cloudinary Connected Successfully!");
});

// 🟢 Start local server ONLY in DEV
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🔥 Dev Server running at http://localhost:${PORT}`)
  );
}

// 🟢 Export required for Vercel
export default app;
