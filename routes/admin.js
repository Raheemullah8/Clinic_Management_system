import express  from "express";



const router = express.Router();
//doctor manage
router.post("/admin/doctors",registerDoctor)
router.get("/admin/doctors",getAllDoctors)
router.get("/admin/doctors/:id",getAllDoctors)
router.put("/admin/doctors/:id",getAllDoctors)
router.delete("/admin/doctors/:id",getAllDoctors)

//patient manage




export default router;