export const GROQ_MODEL_IDS = {
  llama31Instant: "llama-3.1-8b-instant",
  llama3370bVersatile: "llama-3.3-70b-versatile",
  llama4Scout: "meta-llama/llama-4-scout-17b-16e-instruct",
  groqCompound: "groq/compound",
  groqCompoundMini: "groq/compound-mini",
  gptOss120b: "openai/gpt-oss-120b",
  gptOss20b: "openai/gpt-oss-20b",
  llama4Maverick: "meta-llama/llama-4-maverick-17b-128e-instruct",
  qwen332b: "qwen/qwen3-32b",
  gptOssSafeguard20b: "openai/gpt-oss-safeguard-20b",
  llamaPromptGuard22m: "meta-llama/llama-prompt-guard-2-22m",
  llamaPromptGuard86m: "meta-llama/llama-prompt-guard-2-86m",
  whisperLargeV3: "whisper-large-v3",
  whisperLargeV3Turbo: "whisper-large-v3-turbo",
  orpheusEnglish: "canopylabs/orpheus-v1-english",
  orpheusArabicSaudi: "canopylabs/orpheus-arabic-saudi",
} as const;

export type ChatModelTrait = "Fast" | "Smart" | "Balanced";

export type ChatModelOption = {
  id: string;
  name: string;
  traits: ChatModelTrait[];
};

export const DEFAULT_GROQ_MODEL_ID = GROQ_MODEL_IDS.llama31Instant;

export const MODEL_NAMES_BY_ID: Record<string, string> = {
  [GROQ_MODEL_IDS.llama31Instant]: "Llama 3.1 8B",
  [GROQ_MODEL_IDS.llama3370bVersatile]: "Llama 3.3 70B",
  [GROQ_MODEL_IDS.llama4Scout]: "Llama 4 Scout 17B",
  [GROQ_MODEL_IDS.groqCompound]: "Groq Compound",
  [GROQ_MODEL_IDS.groqCompoundMini]: "Groq Compound Mini",
  [GROQ_MODEL_IDS.gptOss120b]: "GPT OSS 120B",
  [GROQ_MODEL_IDS.gptOss20b]: "GPT OSS 20B",
  [GROQ_MODEL_IDS.llama4Maverick]: "Llama 4 Maverick 17B",
  [GROQ_MODEL_IDS.qwen332b]: "Qwen3 32B",
  [GROQ_MODEL_IDS.gptOssSafeguard20b]: "Safety GPT OSS 20B",
  [GROQ_MODEL_IDS.llamaPromptGuard22m]: "Llama Prompt Guard 2 22M",
  [GROQ_MODEL_IDS.llamaPromptGuard86m]: "Prompt Guard 2 86M",
  [GROQ_MODEL_IDS.whisperLargeV3]: "Whisper Large V3",
  [GROQ_MODEL_IDS.whisperLargeV3Turbo]: "Whisper Large V3 Turbo",
  [GROQ_MODEL_IDS.orpheusEnglish]: "Orpheus V1 English TTS",
  [GROQ_MODEL_IDS.orpheusArabicSaudi]: "Orpheus Arabic Saudi TTS",
};

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
  {
    id: GROQ_MODEL_IDS.llama31Instant,
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llama31Instant],
    traits: ["Fast"],
  },
  {
    id: GROQ_MODEL_IDS.llama3370bVersatile,
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llama3370bVersatile],
    traits: ["Smart"],
  },
  {
    id: GROQ_MODEL_IDS.llama4Scout,
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llama4Scout],
    traits: ["Fast"],
  },
  {
    id: GROQ_MODEL_IDS.groqCompound,
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.groqCompound],
    traits: ["Smart"],
  },
  {
    id: GROQ_MODEL_IDS.groqCompoundMini,
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.groqCompoundMini],
    traits: ["Fast"],
  },
  {
    id: GROQ_MODEL_IDS.gptOss120b,
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.gptOss120b],
    traits: ["Smart"],
  },
];

export const VISION_MODEL_IDS = new Set<string>([
  GROQ_MODEL_IDS.llama4Scout,
]);

export const WEB_SEARCH_MODEL_IDS = new Set<string>([
  GROQ_MODEL_IDS.gptOss120b,
]);

export function getGroqModelName(modelId?: string) {
  if (!modelId) {
    return undefined;
  }

  return MODEL_NAMES_BY_ID[modelId] ?? modelId;
}

export function isSelectableChatModel(modelId: string) {
  return CHAT_MODEL_OPTIONS.some((model) => model.id === modelId);
}
