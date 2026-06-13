import mammoth from "mammoth";

export const extractDocx = async (filePath: string): Promise<string> => {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return result.value || "";
};