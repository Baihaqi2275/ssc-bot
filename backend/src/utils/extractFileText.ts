import path from "path";
import { extractPdf } from "./extractPdf";
import { extractDocx } from "./extractDocx";
import { extractXlsx } from "./extractXlsx";

export const extractFileText = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    return await extractPdf(filePath);
  }

  if (ext === ".docx") {
    return await extractDocx(filePath);
  }

  if (ext === ".xlsx" || ext === ".xls") {
    return await extractXlsx(filePath);
  }

  if (ext === ".doc") {
    return "File .doc belum didukung penuh. Silakan ubah ke .docx agar bisa dibaca.";
  }

  return "";
};