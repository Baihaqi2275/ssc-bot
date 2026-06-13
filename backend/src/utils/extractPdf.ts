import fs from "fs";

const pdfParseModule = require("pdf-parse");

export const extractPdf = async (filePath: string): Promise<string> => {
  const buffer = fs.readFileSync(filePath);

  try {
    // Untuk pdf-parse versi lama
    if (typeof pdfParseModule === "function") {
      const data = await pdfParseModule(buffer);
      return data.text || "";
    }

    // Untuk pdf-parse yang export default
    if (typeof pdfParseModule.default === "function") {
      const data = await pdfParseModule.default(buffer);
      return data.text || "";
    }

    // Untuk pdf-parse versi baru yang pakai PDFParse class
    if (pdfParseModule.PDFParse) {
      const parser = new pdfParseModule.PDFParse({
        data: buffer,
      });

      const result = await parser.getText();

      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }

      return result.text || "";
    }

    throw new Error("Format pdf-parse tidak dikenali");
  } catch (error: any) {
    console.log(`Gagal extract PDF ${filePath}:`, error.message);
    return "";
  }
};