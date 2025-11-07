import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    // ✅ Link to User
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // ✅ Admin Assigned Fields
    roomNumber: {
      type: String,
      required: true,
      trim: true
    },

    // ✅ Availability Management
    availableSlots: [{
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
      },
      startTime: {
        type: String, // Format: "09:00 AM"
        required: true
      },
      endTime: {
        type: String, // Format: "05:00 PM"
        required: true
      },
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],

    // ✅ Capacity Management
    maxPatientsPerDay: {
      type: Number,
      default: 20,
      min: 1,
      max: 50
    },

    todayPatientCount: {
      type: Number,
      default: 0
    },

    // ✅ Status
    isAvailable: {
      type: Boolean,
      default: true
    }

  },
  {
    timestamps: true
  }
);

// ✅ Reset todayPatientCount daily (Conceptual)
doctorSchema.methods.resetDailyCount = function() {
  this.todayPatientCount = 0;
  return this.save();
};

// ✅ Check if doctor can take more patients today
doctorSchema.methods.canTakeMorePatients = function() {
  return this.todayPatientCount < this.maxPatientsPerDay;
};

// ✅ Create Model
const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;