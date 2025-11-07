import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    

    // Symptoms of the patient
    symptoms: [{ type: String }],

    // Prescription details
    prescription: [
      {
        medicine: { type: String },
        dosage: { type: String },    // Example: "500mg"
        frequency: { type: String }, // Example: "Twice daily"
        duration: { type: String },  // Example: "5 days"
      },
    ],

    // Tests recommended by doctor
    testsRecommended: [{ type: String }],

    // Additional doctor notes
    notes: { type: String },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt & updatedAt
  }
);

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

export default MedicalRecord;
