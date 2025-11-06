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

        // ✅ 1. Basic validation
        if (!name || !email || !password || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided",
            });
        }

        // ✅ 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        // ✅ 3. Password hashing
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ 4. Create user object
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            dateOfBirth,
            gender: gender || "Other", // default "Other"
            profileImage: req.file ? req.file.path : "",
            role: role || "patient",
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

        // ✅ 5. Save user
        const savedUser = await newUser.save();

        // ✅ 6. Generate JWT token
        const token = generateToken(savedUser._id, savedUser.role);

        // ✅ 7. Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        // ✅ 8. Response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                data: savedUser
            },
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
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
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