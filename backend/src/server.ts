// Polyfill missing DOM classes for pdf-parse/pdfjs-dist in Node.js serverless environment
if (typeof globalThis !== "undefined") {
  (globalThis as any).DOMMatrix = (globalThis as any).DOMMatrix || class DOMMatrix {};
  (globalThis as any).ImageData = (globalThis as any).ImageData || class ImageData {};
  (globalThis as any).Path2D = (globalThis as any).Path2D || class Path2D {};
}

import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { initDB } from "./config/database";

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, async () => {
    await initDB();
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Groq key loaded: ${process.env.GROQ_API_KEY ? "YA" : "TIDAK"}`);
  });
} else {
  // In production (Vercel serverless), initialize database connection during startup phase
  initDB().catch(err => console.error("Database connection startup error", err));
}

export default app;