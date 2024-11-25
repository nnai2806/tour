import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createDestination,
  deleteDestination,
  deleteManyDestinations,
  getDestinations,
  updateDestination,
} from "../controllers/destination.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createDestination);
router.get("/get", getDestinations);
router.delete("/delete/:destinationId", verifyToken, deleteDestination);
router.delete("/delete", verifyToken, deleteManyDestinations);
router.put("/update/:destinationId", verifyToken, updateDestination);

export default router;
