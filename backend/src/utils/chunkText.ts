export const chunkText = (
  text: string,
  chunkSize: number = 700,
  overlap: number = 100
): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const words = text
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");

  const chunks: string[] = [];

  let start = 0;

  while (start < words.length) {
    const end = start + chunkSize;
    const chunk = words.slice(start, end).join(" ");

    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
  }

  return chunks;
};