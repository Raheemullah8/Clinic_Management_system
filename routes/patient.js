import express from "express"
import auth from "../middleware/auth.js"
import requireRole from "../middleware/roleAuth.js"

import { getPatientById, getPatientProfile, getPatients, updatePatientById, updatePatientProfile } from "../controllers/patientController.js";



const router = express.Router();

router.get("/profile",auth,requireRole(["patient"]),getPatientProfile)
router.put("/profile",auth,requireRole(["patient"]),updatePatientProfile)
// ✅ Admin ke liye alag routes
router.get("/patients", auth, requireRole(["admin"]), getPatients);
router.get("/patients:id", auth, requireRole(["admin"]), getPatientById);
router.put("/:id", auth, requireRole(["admin"]), updatePatientById);

export default router


// // Profile Management
// GET    /api/patients/profile       // Get patient profile
// PUT    /api/patients/profile       // Update patient profile

// // Doctor Management
// GET    /api/patients/doctors       // Get all doctors
// GET    /api/patients/doctors/:id   // Get specific doctor

// // Appointment Management
// POST   /api/patients/appointments  // Book appointment
// GET    /api/patients/appointments  // Get my appointments
// PUT    /api/patients/appointments/:id/cancel  // Cancel appointment

// // Medical Records
// GET    /api/patients/medical-records // Get my medical history

