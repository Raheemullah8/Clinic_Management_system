import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Admin Assigned Fields
    roomNumber: {
      type: String,
      required: true,
    },

    // Availability Management
    availableSlots: [
      {
        day: {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
        startTime: { type: String }, // Format: "09:00 AM"
        endTime: { type: String },   // Format: "05:00 PM"
        isAvailable: { type: Boolean, default: true },
      },
    ],

    // Capacity
    maxPatientsPerDay: {
      type: Number,
      default: 20,
    },

    // Current Day Count
    todayPatientCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // ✅ Auto adds createdAt & updatedAt
  }
);

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
