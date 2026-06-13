import { Router } from "express";
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getAllAdmins);
router.get("/:id", authMiddleware, getAdminById);
router.post("/", authMiddleware, createAdmin);
router.put("/:id", authMiddleware, updateAdmin);
router.delete("/:id", authMiddleware, deleteAdmin);

export default router;