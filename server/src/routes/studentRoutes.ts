import express from "express";

import {
  deleteStudent,
  getStudents,
  registerStudent,
  updateStudent,
} from "../controllers/studentController";

const router = express.Router();

router.post("/register", registerStudent);
router.get("/students", getStudents);
router.put("/student/:id", updateStudent);
router.delete("/student/:id", deleteStudent);

export default router;
