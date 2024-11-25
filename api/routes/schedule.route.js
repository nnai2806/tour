import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createSchedule,
  deleteManySchedules,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "../controllers/schedule.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createSchedule);
router.get("/get", getSchedules);
router.delete("/delete/:scheduleId", verifyToken, deleteSchedule);
router.delete("/delete", verifyToken, deleteManySchedules);
router.put("/update/:scheduleId", verifyToken, updateSchedule);

export default router;
