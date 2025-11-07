import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

//create appointment patient
const createAppointment = async (req, res) => {
try {
    const {doctorId,appointmentDate,timeSlot,reason} = req.body;
    const patientId = req.user.id;

    const doctor = await Doctor.findById(doctorId).populate("userId")
    if(!doctor || !doctor.isAvailable ){
        return res.status(404).json({message:"Doctor not found"});
    }

    if(doctor.todayPatientCount >= doctor.maxPatientsPerDay){
        return res.status(400).json({message:"Doctor has reached maximum patient limit for today"});
    }
    const existingAppointment = await Appointment.findOne(
        {
            doctorId,
            appointmentDate,
            timeSlot,
            status: { $in: ["Scheduled", "Completed"]}
        }
    )
    if(existingAppointment){
        return res.status(400).json({message:"The selected time slot is already booked. Please choose a different time."});
    }
    const newaappointment = new Appointment({
        doctorId,
        patientId,
        appointmentDate : new Date(appointmentDate),
        timeSlot,
        reason
    });
    
    await newaappointment.save();
    doctor.todayPatientCount += 1;
    await doctor.save();
    
    await newaappointment.populate("doctor").populate("patient");

    return res.status(201).json({
        message:"Appointment created successfully",
        appointment:newaappointment
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
const getPatientAppointments = async (req,res)=>{
    try {
        const patientId = req.user.id;
        const appointments = await Appointment.find({patientId})
        .populate("doctorId")
        .sort({appointmentDate:-1});

        return res.status(200).json({
            message:"Appointments fetched successfully",
            data:{
                appointments,
                total:appointments.length
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
const getDoctorAppointments = async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
}



