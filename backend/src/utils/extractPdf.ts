import fs from "fs";
// @ts-ignore
import pdf from "pdf-parse";

export async function extractPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);
  return data.text || "";
}