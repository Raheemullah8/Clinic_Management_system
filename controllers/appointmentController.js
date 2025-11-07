import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

//create appointment patient
const createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot, reason } = req.body;
        const patientId = req.user.id;

        const doctor = await Doctor.findById(doctorId).populate("userId")
        if (!doctor || !doctor.isAvailable) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        if (doctor.todayPatientCount >= doctor.maxPatientsPerDay) {
            return res.status(400).json({ message: "Doctor has reached maximum patient limit for today" });
        }
        const existingAppointment = await Appointment.findOne(
            {
                doctorId,
                appointmentDate,
                timeSlot,
                status: { $in: ["Scheduled", "Completed"] }
            }
        )
        if (existingAppointment) {
            return res.status(400).json({ message: "The selected time slot is already booked. Please choose a different time." });
        }
        const newaappointment = new Appointment({
            doctorId,
            patientId,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            reason
        });

        await newaappointment.save();
        doctor.todayPatientCount += 1;
        await doctor.save();

        await newaappointment.populate("doctor").populate("patient");

        return res.status(201).json({
            message: "Appointment created successfully",
            appointment: newaappointment
        });


    } catch (error) {
        console.error("Create Appointment Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
//get all appointments of patient
const getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user.id;
        const appointments = await Appointment.find({ patientId })
            .populate("doctorId")
            .sort({ appointmentDate: -1 });

        return res.status(200).json({
            message: "Appointments fetched successfully",
            data: {
                appointments,
                total: appointments.length
            },
        })

    } catch (error) {
        console.error("Get Patient Appointments Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}
//get doctor appointments
const getDoctorAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user.id });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        const appointments = await Appointment.find({ doctorId: doctor._id })
            .populate("patientId")
            .sort({ appointmentDate: -1 });
        return res.status(200).json({
            message: "Appointments fetched successfully",
            data: {
                appointments,
                total: appointments.length
            },
        });

    } catch (error) {
        console.error("Get Doctor Appointments Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// get all appointments (admin)
const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("doctorId")
            .populate("patientId")
            .sort({ appointmentDate: -1 });
        return res.status(200).json({
            message: "All appointments fetched successfully",
            data: {
                appointments,
                total: appointments.length
            },
        });


    } catch (error) {
        console.error("Get All Appointments Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

// update appointment status (doctor)
const updateAppointmentStatus = async (req,res)=>{
    try {
        const { id } = req.params;
        const { status, diagnosis, prescription, notes } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(id,{
        status,
        ...(diagnosis && { diagnosis }),
        ...(prescription && { prescription }),
        ...(notes && { notes }),

        },
    {new:true} ).populate("patientId").populate("doctorId");
    if(!appointment){
        return res.status(404).json({message:"Appointment not found"});
    }
    return res.status(200).json({
        message:"Appointment updated successfully",
        appointment,
    });
    } catch (error) {
         console.error("Update Appointment Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
    }
}

//  cancle appointment (patient)
const cancleAppointment = async (req,res)=>{
    try {
        const { id} = req.params;
        const patientId = req.user.id;
        const appointment = await Appointment.findOne({_id:id,patientId});
        if(!appointment){
            return res.status(404).json({message:"Appointment not found"});
        }
         if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled"
      });
    }
    appointment.status = "Cancelled";
    await appointment.save();

    const doctor = await Doctor.findById(appointment.doctorId);
    if(doctor && doctor.todayPatientCount > 0){
        doctor.todayPatientCount -=1;
        await doctor.save();
    }
    return res.status(200).json({
        message:"Appointment cancelled successfully",
        appointment,
    });
    } catch (error) {
     
       return  res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
     }
}
const getAvailableSlots = async (req,res)=>{
    try {
        const {doctorId} = req.params;
        const {date} = req.query;
        const doctor = await Doctor.findById(doctorId);
        if(!doctor){
            return res.status(404).json({message:"Doctor not found"});
        }

        const bookedAppointments = await Appointment.find({
                doctorId,
                appointmentDate: new Date(date),
                status: {$in: ["Scheduled","Completed"]}      
        })
        const bookedSlots = bookedAppointments.map(apt=> apt.timeSlot);

            // ✅ Get doctor's available slots for that day
            const appointmentDate = new Date(date);
            const dayname = appointmentDate.toLocaleDateString("en-US", { weekday: "long" });

            const doctorSlots =  doctor.availableSlots.filter(slots =>
                 slots.day === dayname && slots.isAvailable);

                 

    } catch (error) {
        
    }
}


