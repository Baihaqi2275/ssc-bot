export type ChatRole = "system" | "user" | "assistant";

export interface ChatSource {
  title?: string;
  url?: string;
  domain?: string;
  snippet?: string;
}

export interface ChatImageAttachment {
  name: string;
  fileName?: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp";
  dataUrl: string;
}

export interface ChatbotConfig {
  botName: string;
  welcomeMessage: string;
  systemInstruction: string;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  image?: ChatImageAttachment;
  createdAt?: string;
  tokens?: number;
  modelId?: string;
  modelName?: string;
  sources?: ChatSource[];
}
