import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cloudinary from "./utils/cloudinary.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js"
import patientRoutes from "./routes/patient.js"
import doctorsRoutes from "./routes/doctor.js"
import admniRoutes from "./routes/admin.js"
import appoinmentsRoutes from "./routes/appointments.js"
import medcialRecordsRoutes from "./routes/medcialRecords.js"
dotenv.config(); // Load environment variables
connectDB();

const app = express();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Trust proxy (for cookies in production)
app.set("trust proxy", 1);

// ✅ CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/patient",patientRoutes)
app.use("/api/v1/doctors",doctorsRoutes)
app.use("/api/v1/admin",admniRoutes)
app.use("/api/v1/appointments",appoinmentsRoutes)
app.use("/api/v1/medcial",medcialRecordsRoutes)
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
  console.log(`🔥 Server running on port ${PORT}`);
});
