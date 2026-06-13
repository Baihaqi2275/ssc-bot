import { Request, Response } from "express";
import { searchRelevantChunks } from "../services/rag.service";
import { generateAnswerWithAI } from "../services/ai.service";

const chatUsers: any[] = [];
const chatSessions: any[] = [];
const chatMessages: any[] = [];

export const startChat = async (req: Request, res: Response) => {
  try {
    const { name, phone_number } = req.body || {};

    if (!name || !phone_number) {
      return res.status(400).json({
        status: "error",
        message: "Nama dan nomor HP wajib diisi",
      });
    }

    let user = chatUsers.find((item) => item.phone_number === phone_number);

    if (!user) {
      user = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        name,
        phone_number,
        created_at: new Date(),
      };

      chatUsers.push(user);
    }

    const session = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      user_id: user.id,
      title: "Chat Baru",
      created_at: new Date(),
    };

    chatSessions.push(session);

    return res.status(201).json({
      status: "success",
      message: "Sesi chat berhasil dibuat",
      data: {
        user,
        session,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Gagal memulai chat",
    });
  }
};

export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const { user_id, session_id, message } = req.body || {};

    if (!user_id || !session_id || !message) {
      return res.status(400).json({
        status: "error",
        message: "user_id, session_id, dan message wajib diisi",
      });
    }

    const userMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      session_id,
      user_id,
      sender: "user",
      message,
      created_at: new Date(),
    };

    chatMessages.push(userMessage);

    const relevantChunks = searchRelevantChunks(message);

    let botAnswer = "";

if (relevantChunks.length === 0) {
  botAnswer =
    "Maaf, saya belum menemukan informasi tersebut pada dokumen akademik TUS yang tersedia. Silakan ajukan pertanyaan yang berkaitan dengan layanan akademik, tugas akhir, sidang, TOSS, SKPI, TAK, atau persyaratan kelulusan.";
} else {
  const contexts = relevantChunks.map((chunk) => chunk.chunk_text);

  botAnswer = await generateAnswerWithAI({
    question: message,
    contexts,
  });
}
    const sources = relevantChunks.map((chunk) => ({
  document_title: chunk.document_title,
  file_name: chunk.file_name,
  file_url: chunk.file_url,
  chunk_index: chunk.chunk_index,
  score: chunk.score,
}));

    const botMessage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      session_id,
      user_id,
      sender: "bot",
      message: botAnswer,
      sources,
      created_at: new Date(),
    };

    chatMessages.push(botMessage);

    return res.json({
      status: "success",
      message: "Pesan berhasil diproses",
      data: {
        answer: botAnswer,
        sources,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Gagal memproses chat",
    });
  }
};

export const getChatSessionsByUser = async (req: Request, res: Response) => {
  const { user_id } = req.params;

  const sessions = chatSessions.filter((session) => session.user_id === user_id);

  return res.json({
    status: "success",
    message: "Data sesi chat berhasil diambil",
    total: sessions.length,
    data: sessions,
  });
};

export const getChatMessagesBySession = async (req: Request, res: Response) => {
  const { session_id } = req.params;

  const messages = chatMessages.filter(
    (message) => message.session_id === session_id
  );

  return res.json({
    status: "success",
    message: "Data pesan chat berhasil diambil",
    total: messages.length,
    data: messages,
  });
};

export const getAllChatUsers = async (req: Request, res: Response) => {
  return res.json({
    status: "success",
    message: "Data user chat berhasil diambil",
    total: chatUsers.length,
    data: chatUsers,
  });
};