import Patient from "../models/Patient.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt"


const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            dateOfBirth,
            gender,
            role,
            specialization,
            licenseNumber,
            qualifications,
            experience,
            consultationFee,
            department,
            position,
        } = req.body;

        if (!name || !email || !password || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            dateOfBirth,
            gender: gender || "Other",
            profileImage: req.file ? req.file.path : "",
            role: role ,
            ...(role === "doctor" && {
                specialization,
                licenseNumber,
                qualifications: qualifications || [],
                experience,
                consultationFee,
            }),
            ...(role === "admin" && {
                department,
                position,
            }),
        });
 
        const savedUser = await newUser.save();
       
        if (savedUser.role === "patient") {
            try {
                const patient = await Patient.create({
                    userId: savedUser._id,
                    allergies: [],
                    emergencyContact: {
                        name: "",
                        phone: "",
                        relation: "",
                    },
                });
                console.log("✅ Patient created successfully:", patient._id);
            } catch (error) {
                console.error("❌ Patient Creation Error:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error creating patient",
                    error: error.message,
                });
            }
        }
   
        const token = generateToken(savedUser._id, savedUser.role);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: savedUser,
            token,
        });
    } catch (error) {
        console.error("❌ Register Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during registration",
            error: error.message,
        });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            })
        }
        if (!user.isActive) {
            return res.status(400).json({
                success: false,
                message: "Account is deactivated. Please contact admin."
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        const token = generateToken(user._id, user.role)
        res.cookie("token", token, {
          httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })
        return res.status(200).json({
            success: true,
            message: "Login SuccessFull",
            user: {
                data: user
            },
            token
        })

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}

const logout = (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "Lax",
        })
        return res.status(200).json({ success: true, message: "Logout successful" })
    } catch (error) {
        console.error("Logout Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });

    }
}

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            data: {
                user
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}



export { register, login, logout, getUser };