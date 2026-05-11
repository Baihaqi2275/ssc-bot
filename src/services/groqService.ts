import chatbotConfig from "../config/chatbotConfig";
import { DEFAULT_GROQ_MODEL_ID, GROQ_MODEL_IDS } from "../config/groqModels";
import { supportsVision, supportsWebSearch } from "../config/modelCapabilities";
import type { ChatMessage, ChatRole, ChatSource } from "../types/chat";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = DEFAULT_GROQ_MODEL_ID;
const DEFAULT_MAX_COMPLETION_TOKENS = 350;
const COMPOUND_MAX_COMPLETION_TOKENS = 1024;
const GROQ_REQUEST_TIMEOUT_MS = 30_000;
const NORMAL_CHAT_CONTEXT_LIMIT = 6;
const WEB_SEARCH_CONTEXT_LIMIT = 4;
const WEB_SEARCH_ASSISTANT_CONTEXT_LENGTH = 700;
const WEB_SEARCH_USER_CONTEXT_LENGTH = 1200;
const ESTIMATED_CHARS_PER_TOKEN = 4;
const INTERNAL_SOURCE_MARKERS = [
  "browser.search",
  "browser.open",
  "browser.find",
  "browser.click",
  "browser.run",
];
const CHEFBOT_RULE_MODIFICATION_FALLBACK_MESSAGE =
  "Maaf, saya tidak dapat mengubah aturan, daftar menu, atau instruksi utama ChefBot. Saya hanya dapat membantu rekomendasi menu yang sudah tersedia.";
const CHEFBOT_WEB_SEARCH_UNNEEDED_MESSAGE =
  "Mode Web Search tidak diperlukan untuk ChefBot. Matikan Web Search atau pilih model chat biasa seperti Llama 3.1 8B.";
const UNSUPPORTED_REQUEST_CONFIGURATION_MESSAGE =
  "Model yang dipilih tidak mendukung konfigurasi request ini. Pilih model chat biasa untuk menjalankan ChefBot, seperti Llama 3.1 8B atau Llama 3.3 70B.";
const NO_CURRENT_BUDGET_GUIDANCE =
  "Pesan terakhir tidak menyebut budget. Jangan mengasumsikan atau menyebut Rp50.000 atau budget tertentu.";
const BUDGET_50K_LUNCH_GUIDANCE = `Untuk pertanyaan budget sekitar Rp50.000 untuk makan siang:
- Sertakan kombinasi Nasi Goreng Spesial (Rp35.000) + Es Teh Manis (Rp8.000) total Rp43.000
- Sertakan alternatif Ayam Bakar Madu (Rp45.000)
- Gunakan pembuka alami seperti "Dengan budget Rp 50.000..."
- Jelaskan bahwa menu mengenyangkan dan cocok makan siang
- Jawaban ringkas dan natural`;
const VEGETARIAN_GUIDANCE = `Untuk pertanyaan vegetarian:
- Rekomendasikan Gado-Gado Jakarta (Rp25.000)
- Sertakan minuman: Jus Alpukat (Rp18.000) atau Smoothie Mangga (Rp25.000)
- Sertakan dessert: Puding Mangga (Rp15.000)
- Jangan menambahkan catatan alergi kecuali user menyebut alergi
- Gunakan pembuka "Untuk pilihan vegetarian..."
- Jawaban natural, tidak kaku`;
const SWEET_PACKAGE_GUIDANCE = `Untuk pertanyaan manis/dessert:
- Penuhi rasa manis lewat dessert atau nama menu yang eksplisit manis
- Ayam Bakar Madu boleh dianggap condong manis karena "Madu"
- Nasi Goreng Spesial hanya makanan utama netral, jangan sebut sebagai menu manis
- Preferensikan Ayam Bakar Madu + Puding Mangga atau Gado-Gado Jakarta + Puding Mangga`;
const NOT_SPICY_GUIDANCE = `Untuk pertanyaan tidak pedas/tidak terlalu pedas:
- Pilih menu yang tidak tampak pedas dari nama
- Jangan klaim tingkat pedas pasti
- Jangan ulangi "tidak disebutkan secara spesifik dalam menu" per item
- Jika perlu, beri satu catatan akhir: "Untuk tingkat pedas pastinya, sebaiknya konfirmasi ke restoran."`;
const PRESIDENT_GUARDRAIL_GUIDANCE = `Untuk pertanyaan di luar topik seperti politik:
- Tolak dengan sopan sebagai ChefBot
- Jelaskan hanya fokus pada menu restoran
- Arahkan kembali ke rekomendasi makanan
- Gunakan gaya natural seperti: "Maaf, saya ChefBot yang khusus membantu rekomendasi menu restoran..."`;
const MATH_GUARDRAIL_GUIDANCE = `Untuk pertanyaan matematika:
- Tolak dengan sopan
- Sarankan tutor atau asisten akademik
- Arahkan ke rekomendasi camilan atau makanan
- Gunakan gaya natural dan ramah`;
const CHEFBOT_RULE_MODIFICATION_PATTERNS = [
  /\b(?:tambah|tambahkan|masukkan|buat|buatkan)\b.{0,50}\b(?:menu|daftar menu|knowledge base|basis data)\b/,
  /\b(?:menu|daftar menu|knowledge base|basis data)\b.{0,50}\b(?:baru|tambah|tambahkan|masukkan|buat|buatkan)\b/,
  /\b(?:hapus|hilangkan|delete|remove)\b.{0,50}\b(?:menu|daftar menu|knowledge base|basis data)\b/,
  /\b(?:ubah|ganti|edit|update)\b.{0,50}\b(?:harga|price|menu|daftar menu|aturan|rule|rules|instruksi|instruction|instructions|system prompt|system instruction)\b/,
  /\b(?:abaikan|lupakan|ignore|forget)\b.{0,50}\b(?:aturan|rule|rules|instruksi|instruction|instructions|system)\b/,
  /\b(?:jawab bebas|bebas jawab|free answer)\b/,
  /\b(?:anggap kamu bukan chefbot|kamu bukan chefbot|jangan jadi chefbot|berhenti jadi chefbot)\b/,
  /\b(?:ubah|ganti|edit|update)\b.{0,50}\bsystem instruction\b/,
  /\bsystem instruction\b.{0,50}\b(?:ubah|ganti|edit|update)\b/,
];
const DIRECT_MENU_ADD_COMMAND_PATTERN =
  /^(?:tolong\s+|mohon\s+)?(?:tambah|tambahkan|masukkan|buatkan)\s+(?:menu\s+)?[a-z0-9]+(?:\s+[a-z0-9]+){0,4}$/;
const DIRECT_MENU_REMOVE_COMMAND_PATTERN =
  /^(?:tolong\s+|mohon\s+)?(?:hapus|hilangkan|delete|remove)\s+(?:menu\s+)?[a-z0-9]+(?:\s+[a-z0-9]+){0,4}$/;
const MENU_RECOMMENDATION_CONTEXT_PATTERN =
  /\b(?:rekomendasi|sarankan|saran|pilih|pilihkan|budget|harga|pesanan|order|keranjang|paket|cocok|apa)\b/;

type GroqChatCompletionResponse = {
  choices?: Array<{
    citations?: unknown;
    message?: {
      content?: string;
      citations?: unknown;
      executed_tools?: unknown;
      references?: unknown;
      search_results?: unknown;
      sources?: unknown;
    };
    references?: unknown;
    search_results?: unknown;
    sources?: unknown;
  }>;
  citations?: unknown;
  references?: unknown;
  search_results?: unknown;
  sources?: unknown;
  usage?: {
    total_tokens?: number;
  };
};

type SendChatMessageOptions = {
  modelId?: string;
  webSearchEnabled?: boolean;
};

type GroqMessageContent =
  | string
  | Array<
      | {
          type: "text";
          text: string;
        }
      | {
          type: "image_url";
          image_url: {
            url: string;
          };
        }
    >;

type GroqRequestMessage = {
  role: ChatRole;
  content: GroqMessageContent;
};

type GroqRequestBody = {
  model: string;
  messages: GroqRequestMessage[];
  temperature: number;
  max_completion_tokens?: number;
  compound_custom?: {
    tools: {
      enabled_tools: string[];
    };
  };
  tools?: Array<{
    type: "browser_search";
  }>;
  tool_choice?: "required";
};

export type SendChatMessageResult = {
  content: string;
  tokens?: number;
  sources?: ChatSource[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getDomainFromUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function toChatSource(value: unknown): ChatSource | null {
  if (typeof value === "string" && value.trim()) {
    const cleanValue = value.trim();

    if (/^https?:\/\//i.test(cleanValue)) {
      return {
        url: cleanValue,
        domain: getDomainFromUrl(cleanValue),
      };
    }

    return {
      title: cleanValue,
    };
  }

  if (!isRecord(value)) {
    return null;
  }

  const url = getStringValue(value, ["url", "link", "href"]);
  const source: ChatSource = {
    title: getStringValue(value, ["title", "name"]),
    url,
    domain:
      getStringValue(value, ["domain", "source", "hostname"]) ??
      getDomainFromUrl(url),
    snippet: getStringValue(value, ["snippet", "description", "text", "content"]),
  };

  if (!source.title && !source.url && !source.domain && !source.snippet) {
    return null;
  }

  return source;
}

function isInternalPlaceholderSource(source: ChatSource) {
  return [source.title, source.domain, source.url, source.snippet].some(
    (value) => {
      const cleanValue = value?.trim().toLowerCase();

      return Boolean(
        cleanValue &&
          INTERNAL_SOURCE_MARKERS.some((marker) => cleanValue.includes(marker)),
      );
    },
  );
}

function hasRealSourceUrl(url?: string) {
  return /^https?:\/\//i.test(url?.trim() ?? "");
}

function hasRealSourceDomain(domain?: string) {
  const cleanDomain = domain?.trim().toLowerCase();

  return Boolean(
    cleanDomain &&
      !cleanDomain.startsWith("browser.") &&
      !INTERNAL_SOURCE_MARKERS.some((marker) => cleanDomain.includes(marker)),
  );
}

function isUsefulSource(source: ChatSource) {
  if (isInternalPlaceholderSource(source)) {
    return false;
  }

  return hasRealSourceUrl(source.url) || hasRealSourceDomain(source.domain);
}

function collectSources(value: unknown, sources: ChatSource[], depth = 0) {
  if (depth > 4) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      collectSources(item, sources, depth + 1);
    });
    return;
  }

  const source = toChatSource(value);

  if (source) {
    sources.push(source);
  }

  if (!isRecord(value)) {
    return;
  }

  [
    "citations",
    "executed_tools",
    "references",
    "results",
    "search_results",
    "sources",
    "web_search_results",
  ].forEach((key) => {
    collectSources(value[key], sources, depth + 1);
  });
}

function extractSources(data: GroqChatCompletionResponse) {
  const sources: ChatSource[] = [];

  collectSources(data.sources, sources);
  collectSources(data.citations, sources);
  collectSources(data.references, sources);
  collectSources(data.search_results, sources);

  data.choices?.forEach((choice) => {
    collectSources(choice.sources, sources);
    collectSources(choice.citations, sources);
    collectSources(choice.references, sources);
    collectSources(choice.search_results, sources);
    collectSources(choice.message?.executed_tools, sources);
    collectSources(choice.message?.sources, sources);
    collectSources(choice.message?.citations, sources);
    collectSources(choice.message?.references, sources);
    collectSources(choice.message?.search_results, sources);
  });

  const seenSources = new Set<string>();

  return sources.filter((source) => {
    const key = source.url ?? source.title ?? source.domain ?? source.snippet;

    if (!key || !isUsefulSource(source) || seenSources.has(key)) {
      return false;
    }

    seenSources.add(key);
    return true;
  });
}

function isValidImageDataUrl(dataUrl: string) {
  return /^data:image\/(?:png|jpeg|webp);base64,/i.test(dataUrl);
}

function messageHasValidImage(message: ChatMessage) {
  return Boolean(message.image && isValidImageDataUrl(message.image.dataUrl));
}

function responseIndicatesUnsupportedVision(errorBody: string) {
  const cleanBody = errorBody.toLowerCase();
  const mentionsImageInput =
    cleanBody.includes("image") ||
    cleanBody.includes("image_url") ||
    cleanBody.includes("vision") ||
    cleanBody.includes("multimodal");
  const mentionsUnsupportedCapability =
    cleanBody.includes("unsupported") ||
    cleanBody.includes("does not support") ||
    cleanBody.includes("not support") ||
    cleanBody.includes("cannot process") ||
    cleanBody.includes("can't process") ||
    cleanBody.includes("capability");

  return mentionsImageInput && mentionsUnsupportedCapability;
}

async function getResponseErrorBody(response: Response) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

function isCompoundWebSearchModel(modelId: string) {
  return (
    modelId === GROQ_MODEL_IDS.groqCompound ||
    modelId === GROQ_MODEL_IDS.groqCompoundMini
  );
}

function isGptOssBrowserSearchModel(modelId: string) {
  return modelId === GROQ_MODEL_IDS.gptOss120b;
}

function trimMessageContent(content: string, maxLength: number) {
  const cleanContent = content.replace(/\s+/g, " ").trim();

  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }

  return `${cleanContent.slice(0, maxLength).trim()}...`;
}

function toWebSearchContextMessage(
  message: ChatMessage,
  isLatestUserMessage: boolean,
): ChatMessage {
  const maxLength =
    message.role === "assistant"
      ? WEB_SEARCH_ASSISTANT_CONTEXT_LENGTH
      : WEB_SEARCH_USER_CONTEXT_LENGTH;
  const content = isLatestUserMessage
    ? message.content.trim()
    : trimMessageContent(message.content, maxLength);

  return {
    role: message.role,
    content,
  };
}

function getWebSearchMessages(messages: ChatMessage[]) {
  const latestUserOffset = [...messages]
    .reverse()
    .findIndex((message) => message.role === "user");

  if (latestUserOffset === -1) {
    return messages
      .slice(-WEB_SEARCH_CONTEXT_LIMIT)
      .map((message) => toWebSearchContextMessage(message, false));
  }

  const latestUserIndex = messages.length - 1 - latestUserOffset;
  const contextStart = Math.max(0, latestUserIndex - WEB_SEARCH_CONTEXT_LIMIT);

  return messages
    .slice(contextStart, latestUserIndex + 1)
    .filter((message) => message.content.trim().length > 0)
    .map((message, index, contextMessages) =>
      toWebSearchContextMessage(
        message,
        index === contextMessages.length - 1 && message.role === "user",
      ),
    );
}

function getLatestUserMessageOnly(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user" && message.content.trim()) {
      return [toWebSearchContextMessage(message, true)];
    }
  }

  return getWebSearchMessages(messages).slice(-1);
}

function getNormalChatMessages(messages: ChatMessage[]) {
  return messages.slice(-NORMAL_CHAT_CONTEXT_LIMIT);
}

function normalizeChefBotBudgetMessage(content: string) {
  return content
    .toLowerCase()
    .replace(/rp\s*([0-9][0-9.\s]*)/g, " rp$1 ")
    .replace(/[^a-z0-9.\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasExplicitBudgetReference(content: string) {
  const cleanContent = normalizeChefBotBudgetMessage(content);

  if (!cleanContent) {
    return false;
  }

  return (
    /\b(?:budget|anggaran|batas harga|kisaran harga|range harga)\b/.test(
      cleanContent,
    ) ||
    /\b(?:rp|rupiah)\s*[0-9]/.test(cleanContent) ||
    /\b[0-9]+(?:[.,][0-9]+)?\s*(?:ribu|rb)\b/.test(cleanContent) ||
    /\b[0-9][0-9.\s]{2,}\b/.test(cleanContent) ||
    /\b(?:harga)\b.{0,30}\b(?:maksimal|max|di bawah|dibawah|kurang dari|tidak lebih dari|murah|lebih murah)\b/.test(
      cleanContent,
    )
  );
}

function refersToPreviousBudget(content: string) {
  const cleanContent = normalizeChefBotBudgetMessage(content);

  if (!cleanContent) {
    return false;
  }

  return (
    /\b(?:yang tadi|tadi|sebelumnya|budget sebelumnya|anggaran sebelumnya)\b/.test(
      cleanContent,
    ) ||
    /\b(?:versi|pilihan|menu)\b.{0,30}\b(?:lebih murah|termurah|hemat)\b/.test(
      cleanContent,
    )
  );
}

function shouldProtectFromBudgetLeakage(latestUserMessage: string) {
  return (
    isChefBotMode() &&
    !hasExplicitBudgetReference(latestUserMessage) &&
    !refersToPreviousBudget(latestUserMessage)
  );
}

function sanitizePreviousBudgetMentions(content: string) {
  return content
    .replace(
      /\b(?:dengan|untuk|sesuai|pas dengan|masih sesuai|di bawah|dibawah)\s+budget\s+(?:rp\s*)?[0-9][0-9.\s]*(?:ribu|rb)?\b/gi,
      "tanpa membawa budget sebelumnya",
    )
    .replace(
      /\b(?:budget|anggaran)\s*(?:sekitar|sebesar|maksimal|max)?\s*(?:rp\s*)?[0-9][0-9.\s]*(?:ribu|rb)?\b/gi,
      "budget sebelumnya",
    )
    .replace(/\b(?:rp\s*)?50[\s.]*000\b/gi, "budget sebelumnya")
    .replace(/\b50\s*(?:ribu|rb)\b/gi, "budget sebelumnya");
}

function getBudgetLeakageControlledMessages(
  messages: ChatMessage[],
  latestUserMessage: string,
) {
  if (!shouldProtectFromBudgetLeakage(latestUserMessage)) {
    return messages;
  }

  return messages.map((message, index) => {
    if (index === messages.length - 1 || !message.content.trim()) {
      return message;
    }

    return {
      ...message,
      content: sanitizePreviousBudgetMentions(message.content),
    };
  });
}

function toGroqRequestMessage(
  message: ChatMessage,
  modelSupportsVision: boolean,
  includeImage: boolean,
): GroqRequestMessage {
  if (
    includeImage &&
    message.role === "user" &&
    message.image &&
    modelSupportsVision &&
    isValidImageDataUrl(message.image.dataUrl)
  ) {
    return {
      role: message.role,
      content: [
        {
          type: "text",
          text: message.content,
        },
        {
          type: "image_url",
          image_url: {
            url: message.image.dataUrl,
          },
        },
      ],
    };
  }

  return {
    role: message.role,
    content: message.content,
  };
}

function getSystemInstructionMessage(): GroqRequestMessage {
  return {
    role: "system",
    content: chatbotConfig.systemInstruction,
  };
}

function isAbortError(error: unknown) {
  return isRecord(error) && error.name === "AbortError";
}

function isChefBotMode() {
  return chatbotConfig.botName === "ChefBot";
}

function normalizeChefBotUserMessage(content: string) {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeChefBotGuidanceMessage(content: string) {
  return content
    .toLowerCase()
    .replace(/rp\s*50[\s.]*000/g, " 50000 ")
    .replace(/\b50\s*ribu\b/g, " 50000 ")
    .replace(/\b50\s*rb\b/g, " 50000 ")
    .replace(/\b50[\s.]*000\b/g, " 50000 ")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getLatestUserMessageContent(messages: ChatMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (message.role === "user" && message.content.trim()) {
      return message.content;
    }
  }

  return "";
}

function isBudget50kLunchPrompt(cleanContent: string) {
  return (
    /\b50000\b/.test(cleanContent) &&
    /\b(?:makan siang|lunch|mengenyangkan|kenyang)\b/.test(cleanContent)
  );
}

function isVegetarianPrompt(cleanContent: string) {
  return /\b(?:vegetarian|veggie)\b|\btanpa daging\b/.test(cleanContent);
}

function isSweetOrDessertPrompt(cleanContent: string) {
  return /\b(?:manis|dessert|pencuci mulut|madu|coklat|mangga)\b/.test(
    cleanContent,
  );
}

function isNotSpicyPrompt(cleanContent: string) {
  return (
    /\b(?:tidak pedas|tidak terlalu pedas|kurang pedas|jangan pedas|ga pedas|nggak pedas|gak pedas)\b/.test(
      cleanContent,
    ) || /\bpedas\b/.test(cleanContent)
  );
}

function isPresidentGuardrailPrompt(cleanContent: string) {
  return (
    /\bpresiden\b/.test(cleanContent) ||
    (/\bindonesia\b/.test(cleanContent) && /\bsaat ini\b/.test(cleanContent))
  );
}

function isMathGuardrailPrompt(cleanContent: string) {
  return /\b(?:matematika|integral)\b|\btugas matematika\b/.test(cleanContent);
}

function getChefBotDynamicGuidanceMessage(userMessage: string) {
  if (!isChefBotMode()) {
    return null;
  }

  const cleanContent = normalizeChefBotGuidanceMessage(userMessage);

  if (!cleanContent) {
    return null;
  }

  if (isPresidentGuardrailPrompt(cleanContent)) {
    return PRESIDENT_GUARDRAIL_GUIDANCE;
  }

  if (isMathGuardrailPrompt(cleanContent)) {
    return MATH_GUARDRAIL_GUIDANCE;
  }

  const guidanceMessages: string[] = [];

  if (isBudget50kLunchPrompt(cleanContent)) {
    guidanceMessages.push(BUDGET_50K_LUNCH_GUIDANCE);
  }

  if (isVegetarianPrompt(cleanContent)) {
    guidanceMessages.push(VEGETARIAN_GUIDANCE);
  }

  if (isSweetOrDessertPrompt(cleanContent)) {
    guidanceMessages.push(SWEET_PACKAGE_GUIDANCE);
  }

  if (isNotSpicyPrompt(cleanContent)) {
    guidanceMessages.push(NOT_SPICY_GUIDANCE);
  }

  return guidanceMessages.length > 0 ? guidanceMessages.join("\n\n") : null;
}

function isChefBotRuleModificationAttempt(content: string) {
  const cleanContent = normalizeChefBotUserMessage(content);

  if (!cleanContent) {
    return false;
  }

  const matchesRuleModificationPattern =
    CHEFBOT_RULE_MODIFICATION_PATTERNS.some((pattern) =>
      pattern.test(cleanContent),
    );

  if (matchesRuleModificationPattern) {
    return true;
  }

  return (
    (DIRECT_MENU_ADD_COMMAND_PATTERN.test(cleanContent) ||
      DIRECT_MENU_REMOVE_COMMAND_PATTERN.test(cleanContent)) &&
    !MENU_RECOMMENDATION_CONTEXT_PATTERN.test(cleanContent)
  );
}

function getChefBotLocalFallback(messages: ChatMessage[]) {
  if (!isChefBotMode()) {
    return null;
  }

  const latestUserMessage = getLatestUserMessageContent(messages);

  if (!isChefBotRuleModificationAttempt(latestUserMessage)) {
    return null;
  }

  return {
    content: CHEFBOT_RULE_MODIFICATION_FALLBACK_MESSAGE,
  };
}

function logGroqBadRequestDetails(
  modelId: string,
  webSearchEnabled: boolean,
  errorBody: string,
) {
  console.error("Groq API request failed with status 400", {
    modelId,
    webSearchEnabled,
    errorBody,
  });
}

function getGroqMessageContentStats(content: GroqMessageContent) {
  if (typeof content === "string") {
    return {
      contentCharacters: content.length,
      imageCharacters: 0,
      imageCount: 0,
    };
  }

  return content.reduce(
    (stats, item) => {
      if (item.type === "text") {
        stats.contentCharacters += item.text.length;
      } else {
        stats.imageCharacters += item.image_url.url.length;
        stats.imageCount += 1;
      }

      return stats;
    },
    {
      contentCharacters: 0,
      imageCharacters: 0,
      imageCount: 0,
    },
  );
}

function logGroqRequestStats(
  requestBodyText: string,
  requestMessages: GroqRequestMessage[],
) {
  if (!import.meta.env.DEV) {
    return;
  }

  const stats = requestMessages.reduce(
    (totals, message) => {
      const messageStats = getGroqMessageContentStats(message.content);

      totals.contentCharacters += messageStats.contentCharacters;
      totals.imageCharacters += messageStats.imageCharacters;
      totals.imageCount += messageStats.imageCount;

      return totals;
    },
    {
      contentCharacters: 0,
      imageCharacters: 0,
      imageCount: 0,
    },
  );

  console.info("Groq request size", {
    messageCount: requestMessages.length,
    totalCharacters: requestBodyText.length,
    estimatedTokens: Math.ceil(requestBodyText.length / ESTIMATED_CHARS_PER_TOKEN),
    contentCharacters: stats.contentCharacters,
    imageCharacters: stats.imageCharacters,
    imageCount: stats.imageCount,
  });
}

export async function sendChatMessage(
  messages: ChatMessage[],
  options: SendChatMessageOptions = {},
): Promise<SendChatMessageResult> {
  const localFallback = getChefBotLocalFallback(messages);

  if (localFallback) {
    return localFallback;
  }

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  const modelId = options.modelId ?? GROQ_MODEL;
  const modelSupportsVision = supportsVision(modelId);
  const useWebSearchTools =
    options.webSearchEnabled === true && supportsWebSearch(modelId);
  const useCompoundWebSearch = useWebSearchTools && isCompoundWebSearchModel(modelId);
  const latestUserMessage = getLatestUserMessageContent(messages);
  const rawRequestMessages = useCompoundWebSearch
    ? getLatestUserMessageOnly(messages)
    : useWebSearchTools
      ? getWebSearchMessages(messages)
      : getNormalChatMessages(messages);
  const requestMessages = getBudgetLeakageControlledMessages(
    rawRequestMessages,
    latestUserMessage,
  );
  const requestSendsImage =
    modelSupportsVision &&
    requestMessages.some(
      (message, index) =>
        index === requestMessages.length - 1 && messageHasValidImage(message),
    );
  const noCurrentBudgetGuidanceMessage: GroqRequestMessage | null =
    shouldProtectFromBudgetLeakage(latestUserMessage)
      ? {
          role: "system",
          content: NO_CURRENT_BUDGET_GUIDANCE,
        }
      : null;
  const dynamicGuidanceContent = getChefBotDynamicGuidanceMessage(latestUserMessage);
  const dynamicGuidanceMessage: GroqRequestMessage | null = dynamicGuidanceContent
    ? {
        role: "system",
        content: dynamicGuidanceContent,
      }
    : null;

  if (!apiKey) {
    throw new Error("Groq API key is missing. Add VITE_GROQ_API_KEY to your .env file.");
  }

  const requestBody: GroqRequestBody = {
    model: modelId,
    messages: [
      getSystemInstructionMessage(),
      ...(noCurrentBudgetGuidanceMessage ? [noCurrentBudgetGuidanceMessage] : []),
      ...(dynamicGuidanceMessage ? [dynamicGuidanceMessage] : []),
      ...requestMessages.map((message, index) =>
        toGroqRequestMessage(
          message,
          modelSupportsVision,
          index === requestMessages.length - 1,
        ),
      ),
    ],
    temperature: 0.2,
    max_completion_tokens: DEFAULT_MAX_COMPLETION_TOKENS,
  };

  if (useCompoundWebSearch) {
    requestBody.max_completion_tokens = COMPOUND_MAX_COMPLETION_TOKENS;
    requestBody.compound_custom = {
      tools: {
        enabled_tools: ["web_search"],
      },
    };
  }

  if (useWebSearchTools && isGptOssBrowserSearchModel(modelId)) {
    requestBody.tools = [{ type: "browser_search" }];
    requestBody.tool_choice = "required";
  }

  const requestBodyText = JSON.stringify(requestBody);
  const requestBodySize = requestBodyText.length;
  logGroqRequestStats(requestBodyText, requestBody.messages);
  const abortController = new AbortController();
  const timeoutId = globalThis.setTimeout(() => {
    abortController.abort();
  }, GROQ_REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: requestBodyText,
      signal: abortController.signal,
    });
  } catch (fetchError) {
    if (isAbortError(fetchError)) {
      throw new Error(
        "Groq API request timed out. Please check your connection and try again.",
        { cause: fetchError },
      );
    }

    throw fetchError;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorBody = await getResponseErrorBody(response);

    if (
      requestSendsImage &&
      responseIndicatesUnsupportedVision(errorBody)
    ) {
      throw new Error(
        "This model cannot process the selected image. Please switch to Llama 4 Scout.",
      );
    }

    if (response.status === 413 && isCompoundWebSearchModel(modelId)) {
      throw new Error(
        `Groq Compound request is too large (${requestBodySize.toLocaleString()} bytes). Try a shorter query or use GPT OSS 120B.`,
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Batas request Groq sementara tercapai. Tunggu beberapa saat, lalu coba lagi atau pilih model lain.",
      );
    }

    if (response.status === 400) {
      logGroqBadRequestDetails(
        modelId,
        options.webSearchEnabled === true,
        errorBody,
      );

      if (isChefBotMode() && options.webSearchEnabled === true) {
        throw new Error(CHEFBOT_WEB_SEARCH_UNNEEDED_MESSAGE);
      }

      throw new Error(UNSUPPORTED_REQUEST_CONFIGURATION_MESSAGE);
    }

    throw new Error(
      `Groq API request failed with status ${response.status}. Please check the selected model, file format, or request size.`,
    );
  }

  const data = (await response.json()) as GroqChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  const sources = extractSources(data);

  if (!content) {
    throw new Error("Groq API response did not include assistant content.");
  }

  const result: SendChatMessageResult = {
    content,
  };

  if (typeof data.usage?.total_tokens === "number") {
    result.tokens = data.usage.total_tokens;
  }

  if (sources.length > 0) {
    result.sources = sources;
  }

  return result;
}
