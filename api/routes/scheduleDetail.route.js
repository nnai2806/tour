import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createScheduleDetail,
  deleteManyScheduleDetails,
  deleteScheduleDetail,
  getScheduleDetails,
  updateScheduleDetail,
} from "../controllers/scheduleDetail.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createScheduleDetail);
router.get("/get", getScheduleDetails);
router.delete("/delete/:scheduleDetailId", verifyToken, deleteScheduleDetail);
router.delete("/delete", verifyToken, deleteManyScheduleDetails);
router.put("/update/:scheduleDetailId", verifyToken, updateScheduleDetail);

export default router;
