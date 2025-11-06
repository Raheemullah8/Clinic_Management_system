import express from "express";
import { getUser, login, logout, register } from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";


const router = express.Router();

router.post("/register",upload.single("profileImage"),register)
router.post("/login",login)
router.post("/logout",auth,logout)
router.get("/getUser",auth,getUser)


export default router;




// POST  /api/auth/register     // New user registration
// POST  /api/auth/login        // User login
// POST  /api/auth/logout       // User logout
// POST  /api/auth/forgot-password  // Forgot password
// POST  /api/auth/reset-password   // Reset password
// GET   /api/auth/me           // Get current user profile