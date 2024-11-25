import express from "express";
import {
  deleteManyUsers,
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.put("/update/:userId", verifyToken, updateUser);
router.get("/get", getUsers);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.delete("/delete", verifyToken, deleteManyUsers);

export default router;
