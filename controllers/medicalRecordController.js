import MedicalRecord from "../models/MedicalRecord.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js"; 
import Patient from "../models/Patient.js"; // 🛑 Zaroori import for Patient side fetch

// ===================================================================
// ✅ 1. CREATE MEDICAL RECORD (Doctor)
// ===================================================================
const createMedicalRecord = async (req, res) => {
  try {
    const {
      patientId, // Patient Profile ID (from body)
      appointmentId,
      diagnosis,
      symptoms,
      prescription,
      testsRecommended,
      notes
    } = req.body;

    const doctorUserId = req.user.id; // Doctor User ID (from token)

    // 🛑 FIX: Doctor User ID se Doctor Profile ID nikalna
    const doctorProfile = await Doctor.findOne({ userId: doctorUserId });
    if (!doctorProfile) {
        return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }
    const doctorProfileId = doctorProfile._id;
    
    // ✅ 1. Appointment existence aur Doctor ownership check
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctorProfileId // ✅ Match against Doctor Profile ID
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or access denied"
      });
    }

    // ✅ 2. Status check (Medical record sirf completed appointment ka banta hai)
    if (appointment.status !== 'completed') {
        return res.status(400).json({
            success: false,
            message: "Medical record can only be created for a completed appointment."
        });
    }

    // ✅ 3. Check if medical record already exists
    const existingRecord = await MedicalRecord.findOne({ appointmentId });
    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: "Medical record already exists for this appointment"
      });
    }

    // ✅ 4. Create medical record
    const medicalRecord = new MedicalRecord({
      patientId: patientId, 
      doctorId: doctorProfileId, // ✅ Store Doctor Profile ID
      appointmentId,
      diagnosis,
      symptoms: symptoms || [],
      prescription: prescription || [],
      testsRecommended: testsRecommended || [],
      notes: notes || ""
    });

    await medicalRecord.save();

    // ✅ 5. Populate data for response
    await medicalRecord.populate([
      { path: 'patientId', populate: { path: 'userId', select: 'name' } },
      { path: 'doctorId', populate: { path: 'userId', select: 'name specialization' } },
      { path: 'appointmentId', select: 'appointmentDate timeSlot' }
    ]);

    res.status(201).json({
      success: true,
      message: "Medical record created successfully",
      data: { medicalRecord }
    });

  } catch (error) {
    console.error("Create Medical Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ===================================================================
// ✅ 2. GET PATIENT'S MEDICAL RECORDS (Patient)
// ===================================================================
const getPatientMedicalRecords = async (req, res) => {
  try {
    const patientUserId = req.user.id; // Patient User ID from token

    // 🛑 FIX: User ID se Patient Profile ID nikalna
    const patientProfile = await Patient.findOne({ userId: patientUserId });
    
    if (!patientProfile) {
        return res.status(404).json({ success: false, message: "Patient profile not found." });
    }
    const patientProfileId = patientProfile._id; // ✅ Yeh ID use hogi query mein

    const medicalRecords = await MedicalRecord.find({ patientId: patientProfileId }) // ✅ FIX: Patient Profile ID se fetch karein
      .populate("doctorId")
      .populate("appointmentId")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name specialization"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Medical records fetched successfully",
      data: {
        medicalRecords,
        total: medicalRecords.length
      }
    });

  } catch (error) {
    console.error("Get Patient Medical Records Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ===================================================================
// ✅ 3. GET DOCTOR'S CREATED MEDICAL RECORDS
// ===================================================================
const getDoctorMedicalRecords = async (req, res) => {
  try {
    const doctorUserId = req.user.id; // Doctor User ID from token

    // 🛑 FIX: User ID se Doctor Profile ID nikalna
    const doctorProfile = await Doctor.findOne({ userId: doctorUserId });
    if (!doctorProfile) {
        return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }
    const doctorProfileId = doctorProfile._id;

    const medicalRecords = await MedicalRecord.find({ doctorId: doctorProfileId }) // ✅ FIX: Doctor Profile ID se fetch karein
      .populate("patientId")
      .populate("appointmentId")
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name gender dateOfBirth"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Medical records fetched successfully",
      data: {
        medicalRecords,
        total: medicalRecords.length
      }
    });

  } catch (error) {
    console.error("Get Doctor Medical Records Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ===================================================================
// ✅ 4. GET MEDICAL RECORD BY ID
// ===================================================================
const getMedicalRecordById = async (req, res) => {
    // ... (This function already seemed correct, it fetches by record ID)
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Doctor/Patient profile IDs nikalna zaroori hai comparison ke liye
    let profileId = null;
    if (userRole === 'patient') {
        const patientProfile = await Patient.findOne({ userId });
        if (patientProfile) profileId = patientProfile._id;
    } else if (userRole === 'doctor') {
        const doctorProfile = await Doctor.findOne({ userId });
        if (doctorProfile) profileId = doctorProfile._id;
    }
    
    const medicalRecord = await MedicalRecord.findById(id)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name gender dateOfBirth" }
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name specialization" }
      })
      .populate("appointmentId");

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found"
      });
    }

    // ✅ Check access permissions (Using Profile IDs for robust check)
    let hasAccess = false;
    if (userRole === "patient" && medicalRecord.patientId._id.equals(profileId)) {
        hasAccess = true;
    } else if (userRole === "doctor" && medicalRecord.doctorId._id.equals(profileId)) {
        hasAccess = true;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this medical record"
      });
    }

    res.status(200).json({
      success: true,
      message: "Medical record fetched successfully",
      data: { medicalRecord }
    });

  } catch (error) {
    console.error("Get Medical Record By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ===================================================================
// ✅ 5. UPDATE MEDICAL RECORD (Doctor)
// ===================================================================
const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      symptoms,
      prescription,
      testsRecommended,
      notes
    } = req.body;

    const doctorUserId = req.user.id;

    // 🛑 FIX: User ID se Doctor Profile ID nikalna
    const doctorProfile = await Doctor.findOne({ userId: doctorUserId });
    if (!doctorProfile) {
        return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }
    const doctorProfileId = doctorProfile._id;


    // ✅ Check if medical record exists and belongs to this doctor
    const medicalRecord = await MedicalRecord.findOne({
      _id: id,
      doctorId: doctorProfileId // ✅ FIX: Doctor Profile ID se match karein
    });

    if (!medicalRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found or access denied"
      });
    }

    // ✅ Update fields
    if (diagnosis) medicalRecord.diagnosis = diagnosis;
    if (symptoms) medicalRecord.symptoms = symptoms;
    if (prescription) medicalRecord.prescription = prescription;
    if (testsRecommended) medicalRecord.testsRecommended = testsRecommended;
    if (notes) medicalRecord.notes = notes;

    await medicalRecord.save();

    // ✅ Populate updated data
    await medicalRecord.populate([
      { path: 'patientId', populate: { path: 'userId', select: 'name' } },
      { path: 'doctorId', populate: { path: 'userId', select: 'name specialization' } },
      { path: 'appointmentId', select: 'appointmentDate timeSlot' }
    ]);

    res.status(200).json({
      success: true,
      message: "Medical record updated successfully",
      data: { medicalRecord }
    });

  } catch (error) {
    console.error("Update Medical Record Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export {
  createMedicalRecord,
  getPatientMedicalRecords,
  getDoctorMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord
};