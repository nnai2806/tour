import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createCoupon,
  deleteCoupon,
  deleteManyCoupons,
  getCoupons,
  updateCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createCoupon);
router.get("/get", getCoupons);
router.delete("/delete/:couponId", verifyToken, deleteCoupon);
router.delete("/delete", verifyToken, deleteManyCoupons);
router.put("/update/:couponId", verifyToken, updateCoupon);

export default router;
