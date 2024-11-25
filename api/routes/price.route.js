import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createPrice,
  deleteManyPrices,
  deletePrice,
  getPrices,
  updatePrice,
} from "../controllers/price.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createPrice);
router.get("/get", getPrices);
router.delete("/delete/:priceId", verifyToken, deletePrice);
router.delete("/delete", verifyToken, deleteManyPrices);
router.put("/update/:priceId", verifyToken, updatePrice);

export default router;
