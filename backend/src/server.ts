import app from "./app";
import dotenv from "dotenv";
import { loadDatasetToMemory } from "./controllers/document.controller";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);

  await loadDatasetToMemory();
});