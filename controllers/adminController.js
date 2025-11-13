import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import bcrypt from "bcrypt"

const createDoctor = async (req, res) => {
    try {
     
        
        const {
            name,
            email,
            password,
            phone,
            address,
            dateOfBirth,
            gender,
            specialization,
            licenseNumber,
            qualifications,
            experience,
            consultationFee,
            roomNumber
        } = req.body;
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }
        const hashPassword = await await bcrypt.hash(password, 10);
        const newUser = await User({
            name,
            email,
            password: hashPassword,
            phone,
            address,
            dateOfBirth: dateOfBirth || null,
            gender: gender || "Other",
            profileImage:req.file ? req.file.path : "",
            role: "doctor",
            specialization,
            licenseNumber,
            qualifications: qualifications || [],
            experience,
            consultationFee
        });
        const savedUser = await newUser.save();

        const newDoctor = new Doctor({
            userId: savedUser._id,
            roomNumber,
            availableSlots: [],
            maxPatientsPerDay: 10,
            isAvailable: true
        });

        await newDoctor.save();


        return res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            data: {
                doctor: {
                    _id: newDoctor._id,
                    user: {
                        _id: savedUser._id,
                        name: savedUser.name,
                        email: savedUser.email,
                        specialization: savedUser.specialization,
                        experience: savedUser.experience
                    },
                    roomNumber: newDoctor.roomNumber
                }
            }
        });


    } catch (error) {
        console.error("Create Doctor Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// ✅ GET ALL DOCTORS (Admin)
const getAllDoctor = async (req,res) => {
try {
    const doctors = await Doctor.find()
    .populate("userId", "name email phone specialization experience consultationFee qualifications licenseNumber isActive")
    .sort({ createdAt: -1 });

    return res.json({
       success: true,
      message: "All doctors fetched successfully",
      data: {
        doctors,
        total: doctors.length
      }        
    })
} catch (error) {
     console.error("Get All Doctors Admin Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
}
}

// UPDATE DOCTOR (Room change, etc.)
const UpdateDoctor = async (req,res) => {
try {
    const {id} = req.params;
    const {roomNumber, maxPatientsPerDay, isAvailable} = req.body;
    const doctor = await Doctor.findByIdAndUpdate(id,{
      roomNumber,
      maxPatientsPerDay,
      isAvailable
    },
    {new:true}

).populate("userId", "name email phone specialization experience consultationFee qualifications licenseNumber");
if(!doctor){
    return res.status(404).json({
        success:false,
        message:"doctor not found",
    });
}
return  res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: {
        doctor
      }
    });
} catch (error) {
     console.error("Update Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
}
}
//
const deleteDoctor = async (req,res) => {
    try {
        const {id} = req.params;
        const doctor = await Doctor.findById(id)
        if(!doctor){
            return res.status(404)
            .json({
                success:false,
                message:"doctor not found "
            })
        }
        await Doctor.findByIdAndDelete(id);
        await User.findByIdAndUpdate(doctor.userId,{isActive:false})
        
    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully"
    });
    } catch (error) {
          console.error("Delete Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
    }
}

export {createDoctor,getAllDoctor,UpdateDoctor,deleteDoctor}