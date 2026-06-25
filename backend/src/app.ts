import express from "express";
import cors from "cors";
import path from "path";

import chatRoutes from "./routes/chat.routes";
import documentRoutes from "./routes/document.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";

import supportRoutes from "./routes/support.routes";
import { pool } from "./config/database";

const app = express();

app.get(["/_/backend/api/db-test", "/api/db-test"], async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      success: true,
      message: "Database connection successful!",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message || error,
    });
  }
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/dataset", express.static(path.join(process.cwd(), "dataset")));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SSC ChatBot Backend is running.",
  });
});

app.use(["/_/backend/api/auth", "/api/auth"], authRoutes);
app.use(["/_/backend/api/admin", "/api/admin"], adminRoutes);
app.use(["/_/backend/api/users", "/api/users"], userRoutes);
app.use(["/_/backend/api/chat", "/api/chat"], chatRoutes);
app.use(["/_/backend/api/documents", "/api/documents"], documentRoutes);
app.use(["/_/backend/api/support", "/api/support"], supportRoutes);
export default app;