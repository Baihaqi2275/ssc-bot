import Groq from "groq-sdk";
import { TA_SYSTEM_PROMPT } from "../prompts/taPrompt";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type GenerateAnswerParams = {
  question: string;
  context: string;
};

export async function rewriteQuestionForRetrieval(
  question: string
): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 200,
      messages: [
        {
          role: "system",
          content: `
Kamu bertugas merapikan pertanyaan mahasiswa agar lebih mudah dicari pada dokumen layanan akademik SSC.

Aturan:
- Perbaiki typo.
- Ubah singkatan menjadi bentuk yang lebih jelas jika memungkinkan.
- Pertahankan maksud asli user.
- Jangan menjawab pertanyaan.
- Jangan menambahkan informasi baru.
- Output hanya pertanyaan yang sudah dirapikan.
`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const rewritten = completion.choices[0]?.message?.content?.trim();

    if (!rewritten) {
      return question;
    }

    return `${question}\n${rewritten}`;
  } catch (error) {
    console.error("Rewrite question error:", error);
    return question;
  }
}

export async function generateAnswerWithAI({
  question,
  context,
}: GenerateAnswerParams): Promise<string> {
  const hasContext = context && context.trim().length > 80;

  if (!hasContext) {
    return "Maaf, saya belum menemukan informasi tersebut pada dokumen yang tersedia. Saya hanya dapat menjawab pertanyaan berdasarkan dokumen akademik yang sudah diunggah.";
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: TA_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `
Pertanyaan mahasiswa:
${question}

Konteks dokumen yang boleh digunakan untuk menjawab:
${context}

Instruksi jawaban:
- Sintesis seluruh informasi dari konteks menjadi satu jawaban utuh.
- Jangan pernah menyebutkan kata "Konteks", "Dokumen", "Referensi", "Sumber", atau "Chunk".
- Jawab seolah-olah kamu adalah Asisten SSC yang sudah menguasai informasi tersebut dari ingatanmu.
- Jangan mengarang informasi di luar konteks.
- Jika pertanyaan di luar konteks layanan akademik atau tugas akhir, tolak dengan sopan.
- Jika informasi tidak ada dalam konteks, katakan bahwa informasi belum tersedia pada dokumen SSC yang ada.
- Buat jawaban rapi, natural, dan mudah dipahami seperti ChatGPT.
`,
        },
      ],
    });

    return (
      completion.choices[0]?.message?.content?.trim() ||
      "Maaf, saya belum dapat membuat jawaban dari dokumen yang tersedia."
    );
  } catch (error) {
    console.error("Groq AI Service Error:", error);
    return "Maaf, layanan AI sedang mengalami gangguan teknis atau sibuk. Silakan coba beberapa saat lagi.";
  }
}