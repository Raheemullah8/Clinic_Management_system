import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
    try {
        let token;
        token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                messae: "Access denied. No token provided"
            });
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.id).select("-password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }
        if (user.isactive === false) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated",
            });
        }
        // ✅ Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
}
export default auth