import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createProvince,
  deleteManyProvinces,
  deleteProvince,
  getProvinces,
  updateProvince,
} from "../controllers/province.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createProvince);
router.get("/get", getProvinces);
router.delete("/delete/:provinceId", verifyToken, deleteProvince);
router.delete("/delete", verifyToken, deleteManyProvinces);
router.put("/update/:provinceId", verifyToken, updateProvince);

export default router;
