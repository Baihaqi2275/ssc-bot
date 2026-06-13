import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import documentRoutes from "./routes/document.routes";
import chatRoutes from "./routes/chat.routes";

const app = express();

app.use(cors());
app.use(express.json());

const datasetPath = path.join(process.cwd(), "../dataset");
const uploadsPath = path.join(process.cwd(), "uploads");

app.use("/files/dataset", express.static(datasetPath));
app.use("/files/uploads", express.static(uploadsPath));

app.get("/", (req, res) => {
  res.send("Backend SSC Chatbot berjalan");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "API backend aktif",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);

export default app;