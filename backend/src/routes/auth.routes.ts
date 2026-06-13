import { Router } from "express";
import {
  getProfileAdmin,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/me", authMiddleware, getProfileAdmin);
router.post("/logout", authMiddleware, logoutAdmin);

export default router;