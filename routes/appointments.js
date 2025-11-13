import express  from "express";
import { 
    
    cancelAppointment,
     createAppointment, 
     getAllAppointments, 
     getAvailableSlots, 
     getDoctorAppointments, 
     getPatientAppointments,
      updateAppointmentStatus
     } from "../controllers/appointmentController.js";
import  auth from "../middleware/auth.js"
import requireRole from "../middleware/roleAuth.js"

const router = express.Router();

//public routes
router.get("/available-slots/:doctorId", getAvailableSlots);

//patient routes
router.post("/",auth, requireRole(["patient"]), createAppointment);
router.get("/my-appointments",auth, requireRole(["patient"]),getPatientAppointments);
router.put("/:id/cancel",auth, requireRole(["patient"]),cancelAppointment);

//doctor routes
router.get("/doctor/my-appointments",auth, requireRole(["doctor"]),getDoctorAppointments);
router.put("/:id/status",auth, requireRole(["doctor"]),updateAppointmentStatus);

//admin routes

router.get("/appointments", auth, requireRole(["admin"]), getAllAppointments);



export default router;





// GET    /api/appointments           // Get appointments (role-based)
// POST   /api/appointments           // Create appointment
// GET    /api/appointments/:id       // Get specific appointment
// PUT    /api/appointments/:id       // Update appointment
// DELETE /api/appointments/:id       // Delete appointment
// GET    /api/appointments/available-slots/:doctorId  // Get available slots


