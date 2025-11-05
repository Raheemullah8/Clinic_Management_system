import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt & updatedAt
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
