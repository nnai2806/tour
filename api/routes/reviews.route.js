import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createReviews,
  deleteManyReviewss,
  deleteReviews,
  getReviewss,
  updateReviews,
} from "../controllers/reviews.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createReviews);
router.get("/get", getReviewss);
router.delete("/delete/:reviewsId", verifyToken, deleteReviews);
router.delete("/delete", verifyToken, deleteManyReviewss);
router.put("/update/:reviewsId", verifyToken, updateReviews);

export default router;
