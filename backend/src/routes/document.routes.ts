import { Router } from "express";
import {
  importDatasetDocuments,
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  getAllDocumentChunks,
  getChunksByDocumentId,
} from "../controllers/document.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.post("/import-dataset", authMiddleware, importDatasetDocuments);
router.post("/upload", authMiddleware, upload.single("file"), uploadDocument);

router.get("/chunks/all", authMiddleware, getAllDocumentChunks);
router.get("/", authMiddleware, getAllDocuments);
router.get("/:id/chunks", authMiddleware, getChunksByDocumentId);
router.get("/:id", authMiddleware, getDocumentById);

router.delete("/:id", authMiddleware, deleteDocument);

export default router;