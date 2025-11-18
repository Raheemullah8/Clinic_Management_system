  import User from "../models/User.js";
  import Patient from "../models/Patient.js";

  // 🩺 Get Patient Profile
  export const getPatientProfile = async (req, res) => {
      try {
          // 1️⃣ Logged-in user ka record find karo (based on token)
          const patient = await Patient.findOne({ userId: req.user.id })
              .populate("userId", "name email phone address dateOfBirth gender profileImage");

          // 2️⃣ Agar patient record nahi mila
          if (!patient) {
              return res.status(404).json({
                  success: false,
                  message: "Patient profile not found",
              });
          }

          // 3️⃣ Success response
          res.status(200).json({
              success: true,
              message: "Patient profile fetched successfully",
              data: patient,
          });

      } catch (error) {
          console.error("❌ Get Patient Profile Error:", error);
          res.status(500).json({
              success: false,
              message: "Internal server error",
              error: error.message,
          });
      }
  };

  // 🧬 Update Patient Profile
  // export const updatePatientProfile = async (req, res) => {
  //     try {
  //         const { bloodGroup, allergies, emergencyContact } = req.body;

  //         // 1️⃣ Find existing patient record
  //         let patient = await Patient.findOne({ userId: req.user.id });

  //         // 2️⃣ Agar nahi mila to create new
  //         if (!patient) {
  //             patient = new Patient({
  //                 userId: req.user.id,
  //                 bloodGroup,
  //                 allergies,
  //                 emergencyContact,
  //             });
  //         } else {
  //             // 3️⃣ Jo field aaye wahi update karo
  //             if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
  //             if (allergies !== undefined) patient.allergies = allergies;
  //             if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
  //         }

  //         // 4️⃣ Save to DB
  //         const updatedPatient = await patient.save();

  //         res.status(200).json({
  //             success: true,
  //             message: "Patient profile updated successfully",
  //             data: updatedPatient,
  //         });

  //     } catch (error) {
  //         console.error("❌ Update Patient Profile Error:", error);
  //         res.status(500).json({
  //             success: false,
  //             message: "Internal server error",
  //             error: error.message,
  //         });
  //     }
  // };
  export const updatePatientProfile = async (req, res) => {
  try {
    // 1️⃣ Extract data from request body
    const { bloodGroup, allergies, emergencyContact } = req.body;

    // 2️⃣ Validation
    if (!bloodGroup && !allergies && !emergencyContact) {
      return res.status(400).json({
        success: false,
        message: "No fields to update provided",
      });
    }

    // Validate blood group if provided
    const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (bloodGroup && !validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blood group. Must be one of: " + validBloodGroups.join(", "),
      });
    }

    // Validate allergies if provided (should be array)
    if (allergies && !Array.isArray(allergies)) {
      return res.status(400).json({
        success: false,
        message: "Allergies must be an array",
      });
    }

    // Validate emergency contact if provided
    if (emergencyContact) {
      const { name, phone, relation } = emergencyContact;
      
      // Check if at least one field is provided
      if (!name && !phone && !relation) {
        return res.status(400).json({
          success: false,
          message: "Emergency contact must include at least one field (name, phone, or relation)",
        });
      }
    }

    // 3️⃣ Find patient record
    const patient = await Patient.findOne({ userId: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    // 4️⃣ Update only the editable fields
    if (bloodGroup !== undefined) {
      patient.bloodGroup = bloodGroup;
    }
    
    if (allergies !== undefined) {
      // Filter out empty strings and trim values
      patient.allergies = allergies
        .filter(allergy => allergy && allergy.trim())
        .map(allergy => allergy.trim());
    }
    
    if (emergencyContact !== undefined) {
      // Update emergency contact fields
      if (emergencyContact.name !== undefined) {
        patient.emergencyContact.name = emergencyContact.name;
      }
      if (emergencyContact.phone !== undefined) {
        patient.emergencyContact.phone = emergencyContact.phone;
      }
      if (emergencyContact.relation !== undefined) {
        patient.emergencyContact.relation = emergencyContact.relation;
      }
    }

    // 5️⃣ Save updated patient
    await patient.save();

    // 6️⃣ Populate userId for complete response
    await patient.populate("userId", "name email phone address dateOfBirth gender profileImage");

    // 7️⃣ Success response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: patient,
    });

  } catch (error) {
    console.error("❌ Update Patient Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};




  // 🧩 Get All Patients (Admin)
  export const getPatients = async (req, res) => {
    try {
      const patients = await Patient.find()
        .populate("userId", "name email phone address dateOfBirth gender profileImage isActive")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "All patients fetched successfully",
        data: {
          total: patients.length,
          patients,
        },
      });
    } catch (error) {
      console.error("❌ Get All Patients Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  // 🧩 Get Patient By ID (Admin)
  export const getPatientById = async (req, res) => {
    try {
      const { id } = req.params;

      const patient = await Patient.findById(id)
        .populate("userId", "name email phone address dateOfBirth gender profileImage isActive");

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Patient fetched successfully",
        data: patient,
      });
    } catch (error) {
      console.error("❌ Get Patient By ID Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };

  // 🧩 Update Patient By ID (Admin)
  export const updatePatientById = async (req, res) => {
    try {
      const { id } = req.params;
      const { bloodGroup, allergies, emergencyContact } = req.body;

      const patient = await Patient.findByIdAndUpdate(
        id,
        { bloodGroup, allergies, emergencyContact },
        { new: true }
      ).populate("userId", "name email phone address dateOfBirth gender profileImage isActive");

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: "Patient not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Patient updated successfully",
        data: patient,
      });
    } catch (error) {
      console.error("❌ Update Patient By ID Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };




