import express from "express";
import { getUser, login, logout, register } from "../controllers/authController";

const router = express.Router();

router.post("/register",register)
router.post("/login",login)
router.post("/logout",logout)
router.get("/getUser",getUser)





export default router;