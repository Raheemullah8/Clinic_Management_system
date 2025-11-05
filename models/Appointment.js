import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
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
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "No-Show"],
      default: "Scheduled",
    },
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt & updatedAt
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
