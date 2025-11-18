import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ One Patient profile per User
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: null, // ✅ Optional field
    },

    allergies: {
      type: [String], // ✅ Array of strings
      default: [],    // ✅ Default empty array
    },

    emergencyContact: {
      name: { 
        type: String, 
        trim: true,
        default: null,
      },
      phone: { 
        type: String, 
        trim: true,
        default: null,
      },
      relation: { 
        type: String, 
        trim: true,
        default: null,
      },
    },
  },
  {
    timestamps: true, // ✅ Adds createdAt and updatedAt
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;