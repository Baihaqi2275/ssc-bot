import { Router } from "express";
import { registerAdmin, loginAdmin, logoutAdmin, getProfileAdmin } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/me", authMiddleware, getProfileAdmin);

export default router;