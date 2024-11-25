import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createTourType,
  deleteManyTourTypes,
  deleteTourType,
  getTourTypes,
  updateTourType,
} from "../controllers/tourType.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createTourType);
router.get("/get", getTourTypes);
router.delete("/delete/:tourTypeId", verifyToken, deleteTourType);
router.delete("/delete", verifyToken, deleteManyTourTypes);
router.put("/update/:tourTypeId", verifyToken, updateTourType);

export default router;
