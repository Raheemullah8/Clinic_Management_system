  import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ Recommended: Ensures one Patient profile per User
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null
    },

    allergies: [{ // Array of Strings
      type: String,
      trim: true
    }],
    default: [], // 👈 Added default empty array

    emergencyContact: {
      name: { 
            type: String, 
            trim: true,
         
        },
      phone: { 
            type: String, 
            trim: true,
        
        },
      relation: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;