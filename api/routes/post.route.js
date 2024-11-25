import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createPost,
  deleteManyPosts,
  deletePost,
  getPosts,
  updatePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/create", verifyToken, createPost);
router.get("/get", getPosts);
router.delete("/delete/:postId", verifyToken, deletePost);
router.delete("/delete", verifyToken, deleteManyPosts);
router.put("/update/:postId", verifyToken, updatePost);

export default router;
