import Doctor from "../models/Doctor.js";

 const getDoctorProfile = async (req, res) => {
  try {
    // ✅ Logged-in doctor ka userId middleware se aayega
    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate(
        "userId", // ❗️ yahan "userID" nahi, "userId" likhna hai — schema me isi naam se defined hai
        "name email phone address dateOfBirth gender profileImage"
      );

    // ❌ Agar doctor record nahi mila
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    // ✅ Success response
    return res.status(200).json({
      success: true,
      message: "Doctor profile fetched successfully",
      data: doctor, // direct doctor object bhejna best hai
    });
  } catch (error) {
    console.error("❌ Get Doctor Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const updateDoctorProfile = async (req, res) => {
    try {
        const { availableSlots, maxPatientsPerDay, isAvailable } = req.body;
        let doctor = await Doctor.findOne({ userId: req.user.id })

        if (!doctor) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Doctor profile not found"
                })
        }

        if (availableSlots) doctor.availableSlots = availableSlots

        if (maxPatientsPerDay) doctor.maxPatientsPerDay = maxPatientsPerDay

        if (isAvailable === "boolean") doctor.isAvailable = isAvailable

        await doctor.save();
        await doctor.populate("userId", "name email phone address dateOfBirth gender profileImage specialization experience consultationFee qualifications licenseNumber")

        return res.status(200)
            .json(
                {
                    success: false,
                    message: "doctor Profile Update Success full",
                    data: {
                        doctor
                    }
                });

    } catch (error) {
        console.error("Update Doctor Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}

// ✅ GET ALL DOCTORS (Patients & Admin ke liye)
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findOne({ isAvailable: true })
            .populate("userId", "name email phone specialization experience consultationFee qualifications profileImage")
            .sort({ "userId.specialization": 1 });

        return res.status(200)
            .json({
                success: true,
                message: "All doctors fetched successfully",
                data: {
                    doctors,
                    total: doctors.length
                }
            });

    } catch (error) {
        console.error("Get All Doctors Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });

    }

}

// ✅ GET DOCTOR BY ID
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findById(id)
            .populate("userId", "name email phone specialization experience consultationFee qualifications profileImage");
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Doctor fetched successfully",
            data: {
                doctor
            }
        });

    } catch (error) {
        console.error("Get Doctor By ID Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });

    }

}
const updateDoctorAvailability = async (req, res) => {
    try {
        const { availableSlots } = req.body;
        const doctor = await Doctor.findOne({ userId: req.user.id })
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found"
            });
        };

        doctor.availableSlots = availableSlots;
        await doctor.save();

        return res.status(200).json({
            success: true,
            message: "Doctor availability updated successfully",
            data: {
                availableSlots: doctor.availableSlots
            }
        });

    } catch (error) {
        console.error("Update Doctor Availability Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}
// ✅ GET DOCTOR'S AVAILABILITY
const getDoctorAvailability = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) {
            return res.status(404)
                .json({
                    success: false,
                    message: "Doctor profile  not found"
                })
        }
        return res.status(200).json({
            success: true,
            message: "Doctor availability fetched successfully",
            data: {
                availableSlots: doctor.availableSlots
            }
        });
    } catch (error) {
        console.error("Get Doctor Availability Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });

    }
}

export { getDoctorProfile, updateDoctorProfile, getAllDoctors, getDoctorById, updateDoctorAvailability, getDoctorAvailability }
