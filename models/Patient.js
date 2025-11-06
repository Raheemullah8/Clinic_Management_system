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
     allergies: [{
      type: String,
      trim: true
    }],

    emergencyContact: {
      name: { type: String,trim: true },
      phone: { type: String,trim: true },
      relation: { type: String,trim: true },
    },
  },
  {
    timestamps: true, // ✅ Automatically adds createdAt & updatedAt
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
