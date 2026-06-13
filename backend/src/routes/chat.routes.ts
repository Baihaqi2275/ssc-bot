import { Router } from "express";
import {
  startChat,
  sendChatMessage,
  getChatSessionsByUser,
  getChatMessagesBySession,
  getAllChatUsers,
} from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/start", startChat);
router.post("/send", sendChatMessage);

router.get("/users", authMiddleware, getAllChatUsers);
router.get("/sessions/:user_id", authMiddleware, getChatSessionsByUser);
router.get("/messages/:session_id", authMiddleware, getChatMessagesBySession);

export default router;