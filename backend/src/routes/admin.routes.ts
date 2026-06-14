import { Router } from "express";
import { getNotifications, getDashboardStats } from "../controllers/admin.controller";

const router = Router();

router.get("/notifications", getNotifications);
router.get("/stats", getDashboardStats);

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin routes aktif.",
  });
});

export default router;