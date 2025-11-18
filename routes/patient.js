import express from "express"
import auth from "../middleware/auth.js"
import requireRole from "../middleware/roleAuth.js"
import { 
  getPatientById, 
  getPatientProfile, 
  getPatients, 
  updatePatientById, 
  updatePatientProfile 
} from "../controllers/patientController.js";

const router = express.Router();

// Patient routes
router.get("/profile", auth, requireRole(["patient"]), getPatientProfile);
router.put("/profile", auth, requireRole(["patient"]), updatePatientProfile);

// Admin routes
router.get("/", auth, requireRole(["admin"]), getPatients);
router.get("/:id", auth, requireRole(["admin"]), getPatientById);
router.put("/:id", auth, requireRole(["admin"]), updatePatientById);

export default router;