import express  from "express";



const router = express.Router();
//doctor manage
router.post("/admin/doctors",registerDoctor)
router.get("/admin/doctors",getDoctors)
router.get("/admin/doctors/:id",getSingleDoctors)
router.put("/admin/doctors/:id",updateDoctors)
router.delete("/admin/doctors/:id",deleteDoctors)

//patient manage
router.get("/admin/patients",getpatients)
router.get("/admin/patients/:id",getSinglePatients)
router.put("/admin/patients/:id",updatePatients)

//appointments manage
router.get("/admin/appointments",getAppointments)
router.put("/admin/appointments/:id",updateAppointments)

// Dashboard & Reports
router.get("/admin/dashboard",getDashboardData)
router.get("/admin/reports",getReports)





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