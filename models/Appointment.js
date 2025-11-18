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
  enum: ["scheduled", "confirmed", "completed", "cancelled", "no-show"], // ✅ Add "confirmed"
  default: "scheduled",
},
    reason: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    diagnosis: {
      type: String,
      trim: true,
      default: ""
    },
    prescription: {
      type: String,
      trim: true,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });
appointmentSchema.index({ patientId: 1, appointmentDate: 1, timeSlot: 1 }, { unique: true });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

appointmentSchema.virtual("patient", {
  ref: "Patient",
  localField: "patientId",
  foreignField: "_id",
  justOne: true,
});

appointmentSchema.virtual("doctor", {
  ref: "Doctor",
  localField: "doctorId",
  foreignField: "_id",
  justOne: true,
});

appointmentSchema.set("toJSON", { virtuals: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;