import mongoose from "mongoose";

// ✅ User Schema
const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    profileImage: {
      type: String,
      default: "",
    },

    // Role-based Fields
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "admin",
    },

    // Doctor-specific info
    specialization: { type: String },
    licenseNumber: { type: String },
    qualifications: [{ type: String }],
    experience: { type: Number },
    consultationFee: { type: Number },
    department: { type: String },
    position: { type: String },

    // System info
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Auto-manage createdAt & updatedAt
  }
);

// ✅ Create Model
const User = mongoose.model("User", userSchema);

export default User;
