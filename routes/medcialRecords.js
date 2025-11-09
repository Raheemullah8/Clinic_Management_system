import express from "express";
import {
  createMedicalRecord,
  getPatientMedicalRecords,
  getDoctorMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord
} from "../controllers/medicalRecordController.js";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roleAuth.js";

const router = express.Router();

// ✅ Doctor Routes
router.post("/", auth, requireRole(["doctor"]), createMedicalRecord);
router.get("/doctor/my-records", auth, requireRole(["doctor"]), getDoctorMedicalRecords);
router.put("/:id", auth, requireRole(["doctor"]), updateMedicalRecord);

// ✅ Patient Routes
router.get("/patient/my-records", auth, requireRole(["patient"]), getPatientMedicalRecords);
router.get("/:id", auth, getMedicalRecordById); // Both patient and doctor can access specific record

export default router;