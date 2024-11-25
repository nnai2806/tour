import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createTour,
  deleteManyTours,
  deleteTour,
  getTours,
  updateTour,
} from "../controllers/tour.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createTour);
router.get("/get", getTours);
router.delete("/delete/:tourId", verifyToken, deleteTour);
router.delete("/delete", verifyToken, deleteManyTours);
router.put("/update/:tourId", verifyToken, updateTour);

export default router;
