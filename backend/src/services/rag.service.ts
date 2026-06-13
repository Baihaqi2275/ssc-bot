import { documentChunks } from "../controllers/document.controller";

const stopWords = [
  "apa",
  "yang",
  "dan",
  "atau",
  "dengan",
  "untuk",
  "dari",
  "pada",
  "dalam",
  "ke",
  "di",
  "itu",
  "ini",
  "adalah",
  "saya",
  "aku",
  "kamu",
  "bagaimana",
  "gimana",
  "berapa",
  "mohon",
  "tolong",
  "jelaskan",
  "tentang",
];

const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getWords = (text: string) => {
  return normalizeText(text)
    .split(" ")
    .filter((word) => word.length > 2)
    .filter((word) => !stopWords.includes(word));
};

export const searchRelevantChunks = (question: string) => {
  const questionWords = getWords(question);

  if (questionWords.length === 0) {
    return [];
  }

  const scoredChunks = documentChunks.map((chunk) => {
    const chunkText = normalizeText(chunk.chunk_text);

    let score = 0;

    questionWords.forEach((word) => {
      if (chunkText.includes(word)) {
        score += 1;
      }
    });

    return {
      ...chunk,
      score,
    };
  });

  const relevantChunks = scoredChunks
    .filter((chunk) => chunk.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return relevantChunks;
};