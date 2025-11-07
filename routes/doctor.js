
import express from "express"

import {
    getAllDoctors,
    getDoctorAvailability,
    getDoctorById,
    getDoctorProfile,
    updateDoctorAvailability,
    updateDoctorProfile
} from "../controllers/doctorController.js"
import auth from "../middleware/auth.js"
import requireRole from "../middleware/roleAuth.js"
const router = express.Router()


router.get("/profile", auth, requireRole(["doctor"]), getDoctorProfile)
router.put("/profile", auth, requireRole(["doctor"]), updateDoctorProfile)
router.get("/availability", auth, requireRole(["doctor"]), getDoctorAvailability)
router.put("/availability", auth, requireRole(["doctor"]), updateDoctorAvailability)

router.get("/alldoctors", getAllDoctors)
router.get("/:id", getDoctorById)



export default router
// // Profile Management
// GET    /api/doctors/profile        // Get doctor profile
// PUT    /api/doctors/profile        // Update doctor profile

// // Availability Management
// GET    /api/doctors/availability   // Get availability
// PUT    /api/doctors/availability   // Update availability

// // Appointment Management
// GET    /api/doctors/appointments   // Get my appointments
// PUT    /api/doctors/appointments/:id/status  // Update status

// // Patient Management
// GET    /api/doctors/patients       // Get my patients
// POST   /api/doctors/medical-records // Add medical record