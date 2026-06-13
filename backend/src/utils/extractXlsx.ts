import XLSX from "xlsx";

export const extractXlsx = async (filePath: string): Promise<string> => {
  const workbook = XLSX.readFile(filePath);

  let text = "";

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as any[][];

    text += `\nSheet: ${sheetName}\n`;

    jsonData.forEach((row) => {
      text += row.join(" | ") + "\n";
    });
  });

  return text;
};