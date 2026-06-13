import axios from "axios";

type GenerateAnswerParams = {
  question: string;
  contexts: string[];
};

export const generateAnswerWithAI = async ({
  question,
  contexts,
}: GenerateAnswerParams): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  if (!apiKey) {
    return (
      "Berikut informasi yang saya temukan berdasarkan dokumen akademik TUS:\n\n" +
      contexts.join("\n\n").substring(0, 1500)
    );
  }

  const contextText = contexts
    .map((context, index) => `Konteks ${index + 1}:\n${context}`)
    .join("\n\n");

  const systemPrompt = `
Kamu adalah chatbot akademik Student Service Center Telkom University Surabaya.
Tugasmu adalah menjawab pertanyaan mahasiswa hanya berdasarkan konteks dokumen yang diberikan.

Aturan wajib:
1. Jawab hanya berdasarkan konteks dokumen.
2. Jangan menambahkan informasi dari pengetahuan umum di luar konteks.
3. Jika konteks tidak memuat jawaban, katakan bahwa informasi tidak ditemukan pada dokumen yang tersedia.
4. Gunakan bahasa Indonesia yang sopan, jelas, singkat, dan mudah dipahami.
5. Jangan menyebutkan bahwa kamu adalah AI.
6. Jangan membuat data, syarat, angka, tanggal, atau prosedur baru jika tidak ada di konteks.
`;

  const userPrompt = `
Pertanyaan mahasiswa:
${question}

Konteks dokumen:
${contextText}

Buat jawaban yang rapi dan mudah dipahami berdasarkan konteks dokumen tersebut.
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 1000,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices?.[0]?.message?.content || 
    "Maaf, saya belum dapat membuat jawaban dari konteks yang tersedia.";
};