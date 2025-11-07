import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roleAuth.js";
import {
    createDoctor,
    deleteDoctor,
    getAllDoctor,
    UpdateDoctor
} from "../controllers/adminController.js";
import upload from "../middleware/upload.js";


const router = express.Router();
//doctor manage only admin
router.post("/doctors", auth,upload.single("profileImage")  ,requireRole(["admin"]), createDoctor)
router.get("/doctors", auth, requireRole(["admin"]), getAllDoctor)
router.put("/doctors/:id", auth, requireRole(["admin"]), UpdateDoctor)
router.post("/doctors/:id", auth, requireRole(["admin"]), deleteDoctor)

export default router;


// // Doctor Management
// POST   /api/admin/doctors          // Create new doctor
// GET    /api/admin/doctors          // Get all doctors
// GET    /api/admin/doctors/:id      // Get specific doctor
// PUT    /api/admin/doctors/:id      // Update doctor (room change)
// DELETE /api/admin/doctors/:id      // Delete doctor

// // Patient Management
// GET    /api/admin/patients         // Get all patients
// GET    /api/admin/patients/:id     // Get specific patient
// PUT    /api/admin/patients/:id     // Update patient

// // Appointment Management
// GET    /api/admin/appointments     // Get all appointments
// PUT    /api/admin/appointments/:id // Update any appointment

// // Dashboard & Reports
// GET    /api/admin/dashboard        // Get dashboard stats
// GET    /api/admin/reports          // Generate reports