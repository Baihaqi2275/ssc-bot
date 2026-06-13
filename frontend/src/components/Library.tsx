import { useMemo, useState } from "react";
import { GROQ_MODEL_IDS, MODEL_NAMES_BY_ID } from "../config/groqModels";

type LibrarySection = "Production Models" | "Production Systems" | "Preview Models";
type ModelBadge = "Fast" | "Smart" | "Balanced";
type LibraryFilter =
  | "All"
  | "Production Models"
  | "Production Systems"
  | "Preview Models"
  | ModelBadge;
type RateLimitTone = "blue" | "purple" | "green";
type RateLimitColumn = {
  label: "RPM" | "TPM" | "RPD" | "ASH";
  value: string;
  helper: string;
  tone: RateLimitTone;
};

type ModelCard = {
  name: string;
  provider: string;
  pricing: string;
  badge: ModelBadge;
  id: string;
  description: string;
  contextWindow: string;
  maxOutput: string;
  speed: string;
  freeRateLimits: string;
  developerRateLimits: string;
  price: string;
  fileSupport?: string;
  strengths: string[];
  limitations: string[];
  section: LibrarySection;
  deprecated?: boolean;
  unavailableNote?: string;
};

type LibraryProps = {
  onOpenSidebar: () => void;
};

const libraryFilters: LibraryFilter[] = [
  "All",
  "Production Models",
  "Production Systems",
  "Preview Models",
  "Fast",
  "Smart",
  "Balanced",
];

const sectionOrder: LibrarySection[] = [
  "Production Models",
  "Production Systems",
  "Preview Models",
];

const rateLimitColumnDefaults: RateLimitColumn[] = [
  {
    label: "RPM",
    value: "—",
    helper: "requests/min",
    tone: "blue",
  },
  {
    label: "TPM",
    value: "—",
    helper: "tokens/min",
    tone: "purple",
  },
  {
    label: "RPD",
    value: "—",
    helper: "requests/day",
    tone: "green",
  },
];

const modelCards: ModelCard[] = [
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llama31Instant],
    provider: "Meta",
    pricing: "Free Tier",
    badge: "Fast",
    id: GROQ_MODEL_IDS.llama31Instant,
    description:
      "Ultra-fast lightweight model for real-time chat and low-latency tasks with a massive 128K context window.",
    contextWindow: "131,072 tokens",
    maxOutput: "131,072 tokens",
    speed: "560 T/s",
    freeRateLimits: "30 RPM | 6,000 TPM | 1,000 RPD",
    developerRateLimits: "250K TPM | 1K RPM | No daily cap",
    price: "$0.05 input / $0.08 output per 1M tokens",
    strengths: [
      "Extremely fast inference",
      "Large context window",
      "Very low cost",
    ],
    limitations: [
      "Less accurate on complex reasoning",
      "Smaller knowledge base",
    ],
    section: "Production Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llama3370bVersatile],
    provider: "Meta",
    pricing: "Free Tier",
    badge: "Smart",
    id: GROQ_MODEL_IDS.llama3370bVersatile,
    description:
      "Meta's most capable open-source model. Best for complex reasoning, detailed analysis, and long-form generation.",
    contextWindow: "131,072 tokens",
    maxOutput: "32,768 tokens",
    speed: "280 T/s",
    freeRateLimits: "30 RPM | 6,000 TPM | 1,000 RPD",
    developerRateLimits: "300K TPM | 1K RPM | No daily cap",
    price: "$0.59 input / $0.79 output per 1M tokens",
    strengths: ["Best reasoning quality", "Large context", "High accuracy"],
    limitations: ["Slower speed", "Higher cost"],
    section: "Production Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.gptOss120b],
    provider: "OpenAI",
    pricing: "Free Tier",
    badge: "Smart",
    id: GROQ_MODEL_IDS.gptOss120b,
    description:
      "OpenAI's flagship open-weight model with built-in web search, code execution, and strong reasoning.",
    contextWindow: "131,072 tokens",
    maxOutput: "65,536 tokens",
    speed: "500 T/s",
    freeRateLimits: "30 RPM | 6,000 TPM | 1,000 RPD",
    developerRateLimits: "250K TPM | 1K RPM | No daily cap",
    price: "$0.15 input / $0.60 output per 1M tokens",
    strengths: ["Built-in web search", "Code execution", "Strong reasoning"],
    limitations: ["Higher cost", "Proprietary open-weight"],
    section: "Production Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.gptOss20b],
    provider: "OpenAI",
    pricing: "Free Tier",
    badge: "Fast",
    id: GROQ_MODEL_IDS.gptOss20b,
    description:
      "Lightweight OpenAI open-weight model. Great for fast summarization and structured output at low cost.",
    contextWindow: "131,072 tokens",
    maxOutput: "65,536 tokens",
    speed: "1,000 T/s",
    freeRateLimits: "30 RPM | 6,000 TPM | 1,000 RPD",
    developerRateLimits: "250K TPM | 1K RPM | No daily cap",
    price: "$0.075 input / $0.30 output per 1M tokens",
    strengths: ["Very fast", "Large output limit", "Affordable"],
    limitations: ["Less capable than 120B version"],
    section: "Production Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.whisperLargeV3],
    provider: "OpenAI",
    pricing: "Free Tier",
    badge: "Balanced",
    id: GROQ_MODEL_IDS.whisperLargeV3,
    description:
      "State-of-the-art speech recognition model. Converts audio to text with high accuracy across multiple languages.",
    contextWindow: "Audio input",
    maxOutput: "—",
    speed: "Audio model",
    freeRateLimits: "300 RPM | 200K ASH",
    developerRateLimits: "300 RPM | 200K ASH",
    price: "$0.111 per hour of audio | Max file size: 100 MB",
    strengths: [
      "High transcription accuracy",
      "Multilingual",
      "Large file support",
    ],
    limitations: ["Audio only", "Not for text generation"],
    section: "Production Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.whisperLargeV3Turbo],
    provider: "OpenAI",
    pricing: "Free Tier",
    badge: "Fast",
    id: GROQ_MODEL_IDS.whisperLargeV3Turbo,
    description:
      "Faster version of Whisper for real-time transcription with higher throughput and lower cost.",
    contextWindow: "Audio input",
    maxOutput: "—",
    speed: "Audio model",
    freeRateLimits: "400 RPM | 400K ASH",
    developerRateLimits: "400 RPM | 400K ASH",
    price: "$0.04 per hour of audio",
    strengths: [
      "Fastest audio transcription",
      "Very low cost",
      "High throughput",
    ],
    limitations: ["Audio only", "Slightly less accurate than V3"],
    section: "Production Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.groqCompound],
    provider: "Groq",
    pricing: "Always Free",
    badge: "Smart",
    id: GROQ_MODEL_IDS.groqCompound,
    description:
      "AI system powered by multiple models. Uses built-in tools including web search and code execution.",
    contextWindow: "131,072 tokens",
    maxOutput: "8,192 tokens",
    speed: "~450 T/s",
    freeRateLimits: "200K TPM | 200 RPM | No daily cap",
    developerRateLimits: "200K TPM | 200 RPM",
    price: "Always Free (no token charge)",
    strengths: [
      "Web search built-in",
      "Code execution",
      "Multi-model intelligence",
    ],
    limitations: ["Lower rate limits", "Agentic overhead latency"],
    section: "Production Systems",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.groqCompoundMini],
    provider: "Groq",
    pricing: "Always Free",
    badge: "Fast",
    id: GROQ_MODEL_IDS.groqCompoundMini,
    description:
      "Lightweight Groq Compound with web search and tool use at higher speed.",
    contextWindow: "131,072 tokens",
    maxOutput: "8,192 tokens",
    speed: "~450 T/s",
    freeRateLimits: "200K TPM | 200 RPM | No daily cap",
    developerRateLimits: "200K TPM | 200 RPM",
    price: "Always Free (no token charge)",
    strengths: ["Free to use", "Web search capable", "Fast"],
    limitations: ["Less capable than full Compound", "Limited output"],
    section: "Production Systems",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llama4Maverick],
    provider: "Meta",
    pricing: "Free Tier",
    badge: "Smart",
    id: GROQ_MODEL_IDS.llama4Maverick,
    description:
      "Meta's Llama 4 multimodal model with Mixture-of-Experts (128 experts). Supports vision and text.",
    contextWindow: "131,072 tokens",
    maxOutput: "8,192 tokens",
    speed: "600 T/s",
    freeRateLimits: "15 RPM | 3,000 TPM | 500 RPD (reduced quota)",
    developerRateLimits: "300K TPM | 1K RPM | No daily cap",
    price:
      "$0.20 input / $0.60 output per 1M tokens | File Support: Images up to 20 MB",
    strengths: ["Multimodal vision + text", "MoE architecture", "Fast for size"],
    limitations: [
      "Deprecated",
      "Unavailable in chat selector",
      "Use Llama 4 Scout for image Q&A",
    ],
    section: "Preview Models",
    deprecated: true,
    unavailableNote:
      "This model is no longer available through the chat selector.",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llama4Scout],
    provider: "Meta",
    pricing: "Free Tier",
    badge: "Fast",
    id: GROQ_MODEL_IDS.llama4Scout,
    description:
      "Lightweight Llama 4 multimodal model with 16 experts for vision-language tasks.",
    contextWindow: "131,072 tokens",
    maxOutput: "8,192 tokens",
    speed: "750 T/s",
    freeRateLimits: "30 RPM | 6,000 TPM | 1,000 RPD",
    developerRateLimits: "300K TPM | 1K RPM | No daily cap",
    price:
      "$0.11 input / $0.34 output per 1M tokens | File Support: Images up to 20 MB",
    strengths: ["Fast multimodal", "Affordable", "Image understanding"],
    limitations: ["Preview only", "Smaller than Maverick"],
    section: "Preview Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.qwen332b],
    provider: "Alibaba Cloud",
    pricing: "Free Tier",
    badge: "Smart",
    id: GROQ_MODEL_IDS.qwen332b,
    description:
      "Alibaba's Qwen3 with strong multilingual capabilities and large context for complex reasoning.",
    contextWindow: "131,072 tokens",
    maxOutput: "40,960 tokens",
    speed: "400 T/s",
    freeRateLimits: "30 RPM | 6,000 TPM | 1,000 RPD",
    developerRateLimits: "300K TPM | 1K RPM | No daily cap",
    price: "$0.29 input / $0.59 output per 1M tokens",
    strengths: ["Strong multilingual", "Large output", "Good reasoning"],
    limitations: ["Preview only", "Less known than Llama"],
    section: "Preview Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.gptOssSafeguard20b],
    provider: "OpenAI",
    pricing: "Free Tier",
    badge: "Balanced",
    id: GROQ_MODEL_IDS.gptOssSafeguard20b,
    description:
      "Safety-focused variant of GPT OSS 20B for content moderation and safety classification.",
    contextWindow: "131,072 tokens",
    maxOutput: "65,536 tokens",
    speed: "1,000 T/s",
    freeRateLimits: "30 RPM | 6,000 TPM | 1,000 RPD",
    developerRateLimits: "150K TPM | 1K RPM | No daily cap",
    price: "$0.075 input / $0.30 output per 1M tokens",
    strengths: ["High speed", "Safety classification", "Affordable"],
    limitations: ["Preview only", "Specialized use"],
    section: "Preview Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llamaPromptGuard22m],
    provider: "Meta",
    pricing: "Free Tier",
    badge: "Fast",
    id: GROQ_MODEL_IDS.llamaPromptGuard22m,
    description:
      "Ultra-lightweight prompt injection and jailbreak detection model for real-time safety filtering.",
    contextWindow: "512 tokens",
    maxOutput: "512 tokens",
    speed: "Very fast",
    freeRateLimits: "— RPM | 30K TPM | 100 RPM (Developer only)",
    developerRateLimits: "30K TPM | 100 RPM",
    price: "$0.03 input / $0.03 output per 1M tokens",
    strengths: ["Cheapest model", "Ultra-fast", "Prompt safety filtering"],
    limitations: [
      "Very limited context (512 tokens)",
      "Safety use only",
    ],
    section: "Preview Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.llamaPromptGuard86m],
    provider: "Meta",
    pricing: "Free Tier",
    badge: "Fast",
    id: GROQ_MODEL_IDS.llamaPromptGuard86m,
    description:
      "Larger Prompt Guard for more accurate injection detection with slightly more capacity.",
    contextWindow: "512 tokens",
    maxOutput: "512 tokens",
    speed: "Very fast",
    freeRateLimits: "— RPM | 30K TPM | 100 RPM (Developer only)",
    developerRateLimits: "30K TPM | 100 RPM",
    price: "$0.04 input / $0.04 output per 1M tokens",
    strengths: ["Accurate safety filtering", "Very cheap", "Fast"],
    limitations: [
      "Very limited context (512 tokens)",
      "Specialized use only",
    ],
    section: "Preview Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.orpheusEnglish],
    provider: "Canopy Labs",
    pricing: "Free Tier",
    badge: "Balanced",
    id: GROQ_MODEL_IDS.orpheusEnglish,
    description:
      "Text-to-speech model for natural English voice generation with high quality audio.",
    contextWindow: "4,000 tokens",
    maxOutput: "50,000 chars",
    speed: "Audio model",
    freeRateLimits: "250 RPM | 50K TPM",
    developerRateLimits: "250 RPM | 50K TPM",
    price: "$22.00 per 1M characters",
    strengths: ["Natural voice synthesis", "English TTS", "High quality audio"],
    limitations: ["Preview only", "English only", "Character-based pricing"],
    section: "Preview Models",
  },
  {
    name: MODEL_NAMES_BY_ID[GROQ_MODEL_IDS.orpheusArabicSaudi],
    provider: "Canopy Labs",
    pricing: "Free Tier",
    badge: "Balanced",
    id: GROQ_MODEL_IDS.orpheusArabicSaudi,
    description:
      "Text-to-speech model specialized for Saudi Arabic voice generation with natural intonation.",
    contextWindow: "4,000 tokens",
    maxOutput: "50,000 chars",
    speed: "Audio model",
    freeRateLimits: "250 RPM | 50K TPM",
    developerRateLimits: "250 RPM | 50K TPM",
    price: "$40.00 per 1M characters",
    strengths: ["Arabic TTS", "Saudi dialect support", "Specialized"],
    limitations: ["Preview only", "Arabic only", "Most expensive per character"],
    section: "Preview Models",
  },
];

function getBadgeIcon(badge: ModelBadge) {
  if (badge === "Fast") {
    return "bolt";
  }

  if (badge === "Smart") {
    return "auto_awesome";
  }

  return "balance";
}

function getPricingBadgeClassName(pricing: string) {
  if (pricing === "Always Free") {
    return "model-badge model-badge--pricing model-badge--always-free";
  }

  return "model-badge model-badge--pricing model-badge--free-tier";
}

function matchesFilter(model: ModelCard, activeFilter: LibraryFilter) {
  if (activeFilter === "All") {
    return true;
  }

  if (
    activeFilter === "Production Models" ||
    activeFilter === "Production Systems" ||
    activeFilter === "Preview Models"
  ) {
    return model.section === activeFilter;
  }

  return model.badge === activeFilter;
}

function matchesSearch(model: ModelCard, search: string) {
  const cleanSearch = search.trim().toLowerCase();

  if (!cleanSearch) {
    return true;
  }

  const searchableText = [
    model.name,
    model.provider,
    model.id,
    model.description,
    model.pricing,
    model.badge,
    model.section,
    model.price,
    model.unavailableNote,
    ...model.strengths,
    ...model.limitations,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(cleanSearch);
}

function getFilteredGroups(
  activeFilter: LibraryFilter,
  search: string,
) {
  return sectionOrder
    .map((section) => ({
      section,
      models: modelCards.filter(
        (model) =>
          model.section === section &&
          matchesFilter(model, activeFilter) &&
          matchesSearch(model, search),
      ),
    }))
    .filter((group) => group.models.length > 0);
}

function getRateLimitColumns(rateLimits: string) {
  const hasAudioSeconds = rateLimits.includes("ASH");
  const columns: RateLimitColumn[] = rateLimitColumnDefaults.map((column) => ({
    ...column,
  }));

  if (hasAudioSeconds && !rateLimits.includes("TPM")) {
    columns[1] = {
      label: "ASH",
      value: "—",
      helper: "audio sec/hr",
      tone: "purple",
    };
  }

  rateLimits.split("|").forEach((part) => {
    const cleanPart = part.trim();

    if (!cleanPart) {
      return;
    }

    if (/developer only/i.test(cleanPart)) {
      return;
    }

    if (/no daily cap/i.test(cleanPart)) {
      const dailyColumn = columns.find((column) => column.label === "RPD");

      if (dailyColumn) {
        dailyColumn.value = "No cap";
      }

      return;
    }

    const match = cleanPart.match(/^(.+?)\s+(RPM|TPM|RPD|ASH)\b/i);

    if (!match) {
      return;
    }

    const value = match[1].trim();
    const label = match[2].toUpperCase() as RateLimitColumn["label"];
    const column = columns.find((item) => item.label === label);

    if (column) {
      column.value = value;
    }
  });

  return columns;
}

function RateLimitGrid({
  columns,
  compact = false,
}: {
  columns: RateLimitColumn[];
  compact?: boolean;
}) {
  return (
    <div className={`rate-grid ${compact ? "is-compact" : ""}`}>
      {columns.map((column) => (
        <div className="rate-metric" key={column.label}>
          <span className={`rate-dot rate-dot-${column.tone}`} />
          <strong>{column.value}</strong>
          <span>{column.label}</span>
          <small>{column.helper}</small>
        </div>
      ))}
    </div>
  );
}

function getRateTierClassName(label: string) {
  if (label === "Developer") {
    return "rate-tier-pill is-developer";
  }

  if (label === "Always Free") {
    return "rate-tier-pill is-always-free";
  }

  return "rate-tier-pill is-free-tier";
}

function RateLimitsCard({ model }: { model: ModelCard }) {
  const freeColumns = getRateLimitColumns(model.freeRateLimits);
  const developerColumns = getRateLimitColumns(model.developerRateLimits);

  return (
    <div className="rate-card">
      <div className="rate-header">
        <div className="rate-title">
          <span className="material-symbols-outlined" aria-hidden="true">
            speed
          </span>
          <strong>Rate Limits</strong>
        </div>
      </div>
      <div className="rate-divider" />
      <div className="rate-limit-group">
        <div className="rate-group-header">
          <span className={getRateTierClassName(model.pricing)}>
            {model.pricing}
          </span>
        </div>
        <RateLimitGrid columns={freeColumns} />
      </div>

      <div className="rate-limit-group developer-rate-box">
        <div className="rate-group-header">
          <span className={getRateTierClassName("Developer")}>Developer</span>
        </div>
        <RateLimitGrid columns={developerColumns} compact />
      </div>
    </div>
  );
}

function Library({ onOpenSidebar }: LibraryProps) {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("All");
  const [search, setSearch] = useState("");
  const filteredGroups = useMemo(
    () => getFilteredGroups(activeFilter, search),
    [activeFilter, search],
  );

  return (
    <section className="library-page" aria-label="Model library">
      <div className="library-scroll">
        <div className="library-shell">
          <div className="library-hero">
            <button
              type="button"
              className="mobile-menu-button library-menu-button"
              aria-label="Open sidebar"
              onClick={onOpenSidebar}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                menu
              </span>
            </button>

            <div>
              <h1>Model Library</h1>
              <p>Available AI models powered by Groq API</p>
            </div>

            <label className="library-search">
              <span className="material-symbols-outlined" aria-hidden="true">
                search
              </span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search models..."
                aria-label="Search models"
              />
            </label>
          </div>

          <div className="library-filter-row" aria-label="Model filters">
            {libraryFilters.map((filter) => (
              <button
                type="button"
                className={activeFilter === filter ? "active" : ""}
                key={filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredGroups.length === 0 ? (
            <div className="library-empty">
              <span className="material-symbols-outlined" aria-hidden="true">
                search_off
              </span>
              <h2>No models found</h2>
              <p>Try another search term or switch back to All models.</p>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <section className="library-section" key={group.section}>
                <h2>
                  <span aria-hidden="true" />
                  {group.section}
                </h2>
                <div className="library-grid">
                  {group.models.map((model) => (
                    <article className="model-card" key={model.id}>
                      <div className="model-card-header">
                        <div className="model-card-top-row">
                          <div className="model-title-row">
                            <h3>{model.name}</h3>
                            <span>by {model.provider}</span>
                          </div>

                          <div className="model-badge-row">
                            {model.deprecated && (
                              <span className="model-badge model-badge--deprecated">
                                <span
                                  className="material-symbols-outlined"
                                  aria-hidden="true"
                                >
                                  block
                                </span>
                                Deprecated
                              </span>
                            )}
                            <span className={getPricingBadgeClassName(model.pricing)}>
                              <span className="model-badge-dot" aria-hidden="true" />
                              {model.pricing}
                            </span>
                            <span
                              className={`model-badge model-badge--${model.badge.toLowerCase()}`}
                            >
                              <span
                                className="material-symbols-outlined"
                                aria-hidden="true"
                              >
                                {getBadgeIcon(model.badge)}
                              </span>
                              {model.badge}
                            </span>
                          </div>
                        </div>
                        <code>{model.id}</code>
                      </div>

                      <p className="model-description">{model.description}</p>

                      {model.unavailableNote && (
                        <div className="model-unavailable-note">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            info
                          </span>
                          {model.unavailableNote}
                        </div>
                      )}

                      <div className="model-specs" aria-label="Model specs">
                        <div>
                          <span>Context Window</span>
                          <strong>{model.contextWindow}</strong>
                        </div>
                        <div>
                          <span>Max Output</span>
                          <strong>{model.maxOutput}</strong>
                        </div>
                        <div>
                          <span>Speed</span>
                          <strong>{model.speed}</strong>
                        </div>
                      </div>

                      <RateLimitsCard model={model} />

                      <div className="model-price">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          sell
                        </span>
                        <strong>{model.price}</strong>
                      </div>

                      {model.fileSupport && (
                        <div className="model-file-support">
                          <span className="material-symbols-outlined" aria-hidden="true">
                            image
                          </span>
                          File Support: {model.fileSupport}
                        </div>
                      )}

                      <div className="model-notes">
                        <div>
                          <h4>
                            <span
                              className="material-symbols-outlined success"
                              aria-hidden="true"
                            >
                              check_circle
                            </span>
                            Strengths
                          </h4>
                          <ul>
                            {model.strengths.map((strength) => (
                              <li key={strength}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4>
                            <span
                              className="material-symbols-outlined danger"
                              aria-hidden="true"
                            >
                              cancel
                            </span>
                            Limitations
                          </h4>
                          <ul>
                            {model.limitations.map((limitation) => (
                              <li key={limitation}>{limitation}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="use-model-button"
                        disabled={model.deprecated}
                      >
                        {model.deprecated ? "Unavailable" : "Available"}
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}

          <aside className="library-info-box" aria-label="Free tier info">
            <div>
              <div className="library-info-title">
                <span className="material-symbols-outlined" aria-hidden="true">
                  info
                </span>
                Free Tier Info
              </div>
              <p>
                All Groq models are accessible on the free tier. Limits reset
                every minute (RPM/TPM) and every day (RPD).
              </p>
              <small>
                Upgrade to a paid Developer tier to remove daily request caps.
              </small>
            </div>
            <div className="library-info-chips" aria-hidden="true">
              <span className="info-rpm">
                <strong>30</strong> RPM
              </span>
              <span className="info-tpm">
                <strong>6,000</strong> TPM
              </span>
              <span className="info-rpd">
                <strong>1,000</strong> RPD
              </span>
            </div>
          </aside>

          <footer className="library-footer">
            Data sourced from Groq API Documentation. Pricing and limits subject
            to change.
          </footer>
        </div>
      </div>
    </section>
  );
}

export default Library;
