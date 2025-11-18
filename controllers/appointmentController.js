import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

// ✅ CREATE APPOINTMENT (Patient)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, timeSlot, reason } = req.body;
    const patientId = req.user.id;
    const  patientProfile = await Patient.findOne({ userId: patientId });
    if (!patientProfile) {
        return res.status(404).json({
            success: false,
            message: "Patient profile not found"
        });
    }
    const patientProfileId = patientProfile._id;
    

    // ✅ Check if doctor exists and is available
    const doctor = await Doctor.findById(doctorId).populate("userId"," name specialization");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // ✅ Check if doctor has reached daily limit
    if (doctor.todayPatientCount >= doctor.maxPatientsPerDay) {
      return res.status(400).json({
        success: false,
        message: "Doctor has reached maximum patients for today"
      });
    }

    // ✅ Check for existing appointment at same time
    const existingAppointment = await Appointment.findOne({
      
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ["scheduled", "completed"] } // ✅ small letters
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Time slot already booked"
      });
    }

    // ✅ Create new appointment
    const appointment = new Appointment({
      patientId: patientProfileId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime: timeSlot,
      timeSlot,
      reason,
      status: "scheduled" // ✅ small 's'
    });

    await appointment.save();

    // ✅ Increment doctor's daily count
    doctor.todayPatientCount += 1;
    await doctor.save();

    // ✅ Populate appointment data
    await appointment.populate([
      { path: 'patientId', populate: { path: 'userId', select: 'name phone email' } },
      { path: 'doctorId', populate: { path: 'userId', select: 'name specialization email' } }
    ]);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointment
      }
    });

  } catch (error) {
    console.error("Create Appointment Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ✅ GET PATIENT'S APPOINTMENTS
const getPatientAppointments = async (req, res) => {
  try {
    const userId = req.user.id; // User ID
    
    // 🛑 CRITICAL FIX: User ID se Patient Profile ID dhundna
    const patientProfile = await Patient.findOne({ userId });

    if (!patientProfile) {
        return res.status(404).json({
            success: false,
            message: "Patient profile not found. Cannot fetch appointments."
        });
    }

    const patientProfileId = patientProfile._id; // ✅ Correct Patient Profile ID

    // Appointment.find mein ab Correct Patient Profile ID istemal hogi
    const appointments = await Appointment.find({ patientId: patientProfileId })
      .populate("doctorId")
      .populate({
        path: "doctorId",
        populate: {
          path: "userId",
          select: "name specialization experience consultationFee"
        }
      })
      .sort({ appointmentDate: -1 });

    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: {
        appointments,
        total: appointments.length
      }
    });

  } catch (error) {
    console.error("Get Patient Appointments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ✅ GET DOCTOR'S APPOINTMENTS
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: "Doctor not found" 
      });
    }
    
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId")
      .populate({
        path: "patientId",
        populate: {
          path: "userId",
          select: "name phone gender dateOfBirth"
        }
      })
      .sort({ appointmentDate: -1 });
      
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully",
      data: {
        appointments,
        total: appointments.length
      }
    });

  } catch (error) {
    console.error("Get Doctor Appointments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ✅ GET ALL APPOINTMENTS (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId")
      .populate("doctorId")
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name phone" }
      })
      .populate({
        path: "doctorId", 
        populate: { path: "userId", select: "name specialization" }
      })
      .sort({ appointmentDate: -1 });

    return res.status(200).json({
      success: true,
      message: "All appointments fetched successfully",
      data: {
        appointments,
        total: appointments.length
      }
    });

  } catch (error) {
    console.error("Get All Appointments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// ✅ UPDATE APPOINTMENT STATUS (Doctor)
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id: appointmentId } = req.params;
        const { status } = req.body;
        const userId = req.user.id; // Doctor's User ID from token
        
        // 1. Status Validation
       // appointmentController.js - updateAppointmentStatus function
// appointmentController.js - updateAppointmentStatus function
const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status provided. Must be one of: scheduled, confirmed, cancelled, completed."
            });
        }
        
        // 2. Doctor Profile Lookup
        const doctorProfile = await Doctor.findOne({ userId });
        if (!doctorProfile) {
            return res.status(404).json({
                success: false,
                message: "Doctor profile not found."
            });
        }
        const doctorProfileId = doctorProfile._id;

        // 3. Appointment dhoondhna aur Doctor Verification
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }
        
        // Verify ke update karne wala Doctor hi is appointment ka owner hai
        if (!appointment.doctorId.equals(doctorProfileId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update the status of this appointment."
            });
        }

        // 4. Status update karna
        appointment.status = status;
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: `Appointment status updated to ${status} successfully.`,
            data: {
                appointment
            }
        });

    } catch (error) {
        console.error("Update Appointment Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// ✅ CANCEL APPOINTMENT (Patient)
const cancelAppointment = async (req, res) => {
    try {
        const { id: appointmentId } = req.params;
        const userId = req.user.id; // Woh user jo action le raha hai
        const userRole = req.user.role; // User ka role (patient ya doctor)

        // 1. Appointment dhoondhna
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }
        
        // Agar pehle se hi cancelled ya completed hai, toh ruk jaao
        if (appointment.status === 'cancelled' || appointment.status === 'completed') {
             return res.status(400).json({
                success: false,
                message: `Cannot cancel appointment. Current status: ${appointment.status}.`
            });
        }

        // 2. Role check aur Authorization
        let isAuthorized = false;

        if (userRole === 'patient') {
            // Patient apni appointment cancel kar sakta hai
            const patientProfile = await Patient.findOne({ userId: userId });
            if (patientProfile && appointment.patientId.equals(patientProfile._id)) {
                isAuthorized = true;
            }
        } else if (userRole === 'doctor') {
            // Doctor apni appointment cancel kar sakta hai
            const doctorProfile = await Doctor.findOne({ userId: userId });
            if (doctorProfile && appointment.doctorId.equals(doctorProfile._id)) {
                isAuthorized = true;
                
                // Agar doctor cancel karta hai toh humein todayPatientCount bhi update karna pad sakta hai (Optional, but recommended)
                // Hum filhaal yeh optional step chhod rahe hain taake code simple rahe.
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to cancel this appointment."
            });
        }

        // 3. Status update karna
        appointment.status = 'cancelled';
        await appointment.save();

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully.",
            data: {
                appointment
            }
        });

    } catch (error) {
        console.error("Cancel Appointment Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // 1. Check doctor & Populate userId
    const doctor = await Doctor.findById(doctorId)
    .populate("userId", "name specialization");
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // 2. Date Range Setup (Timezone Fix for Appointment Search)
    const inputDate = new Date(date); 
    const startOfDay = new Date(inputDate);
    startOfDay.setUTCHours(0, 0, 0, 0); 
    const endOfDay = new Date(inputDate);
    endOfDay.setUTCHours(23, 59, 59, 999); 
    
    // 3. Get booked appointments using Date Range 
    const bookedAppointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startOfDay, 
        $lte: endOfDay  
      },
      status: { $in: ["scheduled", "confirmed", "completed"] } 
    });
    
    const bookedSlots = bookedAppointments.map((apt) => apt.timeSlot);
    
    // 4. Get doctor's available slots for that day
    // 🛑 FIX: TimeZone: "UTC" force karna taake din "Monday" hi aaye, "Sunday" nahi
    const dayName = inputDate.toLocaleDateString("en-US", { 
        weekday: "long",
        timeZone: "UTC" // ✅ Final Fix
    }); 
    
    const doctorSlots = doctor.availableSlots.filter(
      (slot) =>
        slot.day.toLowerCase() === dayName.toLowerCase() && 
        slot.isAvailable
    );

    // 5. Generate available time slots
    const availableSlots = doctorSlots.flatMap((slot) => {
      const slots = [];
      let currentTime = new Date(`1970-01-01 ${slot.startTime}`);
      const endTime = new Date(`1970-01-01 ${slot.endTime}`);

      while (currentTime < endTime) {
        const timeString = currentTime.toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", hour12: true,
        });

        if (!bookedSlots.includes(timeString)) {
          slots.push(timeString);
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
      return slots;
    });

    return res.status(200).json({
      success: true,
      message: "Available slots fetched successfully",
      data: {
        availableSlots,
        doctor: {
          name: doctor.userId?.name,
          roomNumber: doctor.roomNumber,
          specialization: doctor.userId?.specialization
        }
      }
    });

  } catch (error) {
    console.error("Get Available Slots Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
export {
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots
};