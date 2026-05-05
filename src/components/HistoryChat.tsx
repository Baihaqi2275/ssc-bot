import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import DeleteChatModal from "./DeleteChatModal";
import DynamicIslandToast from "./DynamicIslandToast";
import { getGroqModelName } from "../config/groqModels";
import {
  createChatHistoryExport,
  deleteChatSession,
  getAllSavedChatSessions,
  GROQ_MODEL_NAME,
  importChatHistorySessions,
  parseChatHistoryExport,
  type SavedChatSession,
} from "../services/chatStorage";
import type { ChatMessage } from "../types/chat";

type HistoryChatProps = {
  onDeleteChat: (chatId: string) => void;
  onOpenChat: (chatId: string) => void;
  onOpenSidebar: () => void;
};

type HistoryGroup = {
  label: string;
  sessions: SavedChatSession[];
};

type ToastMessage = {
  title: string;
  subtitle?: string;
};

function isToday(date: Date) {
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isYesterday(date: Date) {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
}

function formatClockTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateMonth(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function formatHistoryTime(date: Date) {
  if (isToday(date)) {
    return `Today, ${formatClockTime(date)}`;
  }

  return `${formatDateMonth(date)}, ${formatClockTime(date)}`;
}

function getValidDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getSessionDate(session: SavedChatSession) {
  const lastMessage = session.messages.at(-1);

  return (
    getValidDate(lastMessage?.createdAt) ??
    getValidDate(session.updatedAt) ??
    new Date()
  );
}

function getGroupLabel(session: SavedChatSession) {
  const date = getSessionDate(session);

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return "Earlier";
}

function isMarkdownTableSeparatorLine(line: string) {
  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  return (
    cells.length > 1 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")))
  );
}

function cleanMarkdownTablePreviewLine(line: string) {
  if (!line.includes("|")) {
    return line;
  }

  if (isMarkdownTableSeparatorLine(line)) {
    return "";
  }

  const cells = line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);

  return cells.length > 1 ? cells.join(" ") : line.replace(/\|/g, " ");
}

function cleanHistoryPreviewText(content: string) {
  const cleanedLines = content
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?p\s*>/gi, " ")
    .replace(/【[^】]*†[^】]*】/g, "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      cleanMarkdownTablePreviewLine(line)
        .replace(/^\s{0,3}#{1,6}\s+/, "")
        .replace(/\*\*([^*\n]+?)\*\*/g, "$1")
        .replace(/(^|[^\w*_])\*(?![\s*])([^*\n]*?\S)\*(?!\*)/g, "$1$2")
        .replace(/(^|[^\w*_])_(?![\s_])([^_\n]*?\S)_(?![\w_])/g, "$1$2")
        .replace(/\|/g, " "),
    )
    .join(" ");

  return cleanedLines.replace(/\s+/g, " ").trim();
}

function getMessagePreview(messages: ChatMessage[]) {
  const lastMessage = messages.at(-1);
  const firstUserMessage = messages.find((message) => message.role === "user");
  const preview = lastMessage?.content || firstUserMessage?.content || "";

  return cleanHistoryPreviewText(preview) || "No message preview available.";
}

function getTotalTokens(messages: ChatMessage[]) {
  return messages.reduce((total, message) => total + (message.tokens ?? 0), 0);
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function getSessionModelNames(session: SavedChatSession) {
  const assistantModelNames = session.messages
    .filter((message) => message.role === "assistant")
    .map(
      (message) =>
        message.modelName ??
        getGroqModelName(message.modelId) ??
        undefined,
    )
    .filter((modelName): modelName is string => Boolean(modelName));
  const uniqueAssistantModelNames = [...new Set(assistantModelNames)];

  if (uniqueAssistantModelNames.length > 0) {
    return uniqueAssistantModelNames;
  }

  return [
    getGroqModelName(session.model) ??
      getGroqModelName(GROQ_MODEL_NAME) ??
      GROQ_MODEL_NAME,
  ];
}

function formatSessionModelSummary(session: SavedChatSession) {
  return getSessionModelNames(session).join(" • ");
}

function formatCompactSessionModelSummary(session: SavedChatSession) {
  const modelCount = getSessionModelNames(session).length;

  if (modelCount === 1) {
    return formatSessionModelSummary(session);
  }

  return `${modelCount} models`;
}

function buildChatLink(chatId: string) {
  return `/?chat=${encodeURIComponent(chatId)}`;
}

function getGroupedSessions(sessions: SavedChatSession[]) {
  const groups: HistoryGroup[] = [
    { label: "Today", sessions: [] },
    { label: "Yesterday", sessions: [] },
    { label: "Earlier", sessions: [] },
  ];

  sessions.forEach((session) => {
    const group = groups.find((item) => item.label === getGroupLabel(session));

    group?.sessions.push(session);
  });

  return groups.filter((group) => group.sessions.length > 0);
}

function HistoryChat({
  onDeleteChat,
  onOpenChat,
  onOpenSidebar,
}: HistoryChatProps) {
  const [sessions, setSessions] = useState<SavedChatSession[]>(() =>
    getAllSavedChatSessions(),
  );
  const [search, setSearch] = useState("");
  const [pendingDeleteSession, setPendingDeleteSession] =
    useState<SavedChatSession | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const filteredSessions = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) {
      return sessions;
    }

    return sessions.filter((session) => {
      const preview = getMessagePreview(session.messages);

      return (
        session.chatTitle.toLowerCase().includes(cleanSearch) ||
        preview.toLowerCase().includes(cleanSearch)
      );
    });
  }, [search, sessions]);

  const groupedSessions = useMemo(
    () => getGroupedSessions(filteredSessions),
    [filteredSessions],
  );
  const totalTokens = filteredSessions.reduce(
    (total, session) => total + getTotalTokens(session.messages),
    0,
  );
  const modelNames = new Set(
    filteredSessions.flatMap((session) => getSessionModelNames(session)),
  );

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2600);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [toastMessage]);

  function showToast(title: string, subtitle?: string) {
    setToastMessage({ title, subtitle });
  }

  function handleExportHistory() {
    const exportData = createChatHistoryExport();

    if (exportData.sessions.length === 0) {
      showToast("No history to export", "Start a chat before exporting history");
      return;
    }

    const exportJson = JSON.stringify(exportData, null, 2);
    const exportBlob = new Blob([exportJson], {
      type: "application/json",
    });
    const exportUrl = URL.createObjectURL(exportBlob);
    const exportLink = document.createElement("a");
    const exportDate = new Date().toISOString().slice(0, 10);

    exportLink.href = exportUrl;
    exportLink.download = `takon-ai-history-${exportDate}.json`;
    exportLink.click();
    URL.revokeObjectURL(exportUrl);
    showToast("History exported", "JSON backup downloaded");
  }

  function handleImportHistoryClick() {
    importInputRef.current?.click();
  }

  async function handleImportHistory(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.currentTarget.files?.[0];
    const fileInput = event.currentTarget;

    if (!selectedFile) {
      fileInput.value = "";
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".json")) {
      showToast("Invalid history file", "Please choose a JSON export file");
      fileInput.value = "";
      return;
    }

    try {
      const fileText = await selectedFile.text();
      const parsedFile = JSON.parse(fileText) as unknown;
      const importedSessions = parseChatHistoryExport(parsedFile);

      if (importedSessions.length === 0) {
        showToast("Invalid history file", "No valid chat sessions were found");
        return;
      }

      const importCount = importChatHistorySessions(importedSessions);

      if (importCount === 0) {
        showToast("Invalid history file", "History could not be imported");
        return;
      }

      setSessions(getAllSavedChatSessions());
      showToast(
        "History imported",
        `${formatNumber(importCount)} conversation${
          importCount === 1 ? "" : "s"
        } restored`,
      );
    } catch {
      showToast("Invalid history file", "The selected JSON could not be read");
    } finally {
      fileInput.value = "";
    }
  }

  function handleRequestDelete(
    event: MouseEvent<HTMLButtonElement>,
    session: SavedChatSession,
  ) {
    event.stopPropagation();
    setPendingDeleteSession(session);
  }

  function handleConfirmDelete() {
    if (!pendingDeleteSession) {
      return;
    }

    deleteChatSession(pendingDeleteSession.chatId);
    setSessions(getAllSavedChatSessions());
    onDeleteChat(pendingDeleteSession.chatId);
    setPendingDeleteSession(null);
    showToast("History chat deleted", "Conversation removed from your history");
  }

  function handleCancelDelete() {
    setPendingDeleteSession(null);
  }

  function handleCopyLink(
    event: MouseEvent<HTMLButtonElement>,
    chatId: string,
  ) {
    event.stopPropagation();

    if (!navigator.clipboard) {
      return;
    }

    const link = `${window.location.origin}${buildChatLink(chatId)}`;

    void navigator.clipboard.writeText(link);
  }

  return (
    <section className="history-page" aria-label="Chat history">
      <header className="history-header">
        <button
          type="button"
          className="mobile-menu-button history-menu-button"
          aria-label="Open sidebar"
          onClick={onOpenSidebar}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            menu
          </span>
        </button>
        <div>
          <h1>History Chat</h1>
          <p>All your previous conversations</p>
        </div>
        <div className="history-header-tools">
          <input
            type="file"
            className="hidden-file-input"
            accept=".json"
            ref={importInputRef}
            onChange={(event) => void handleImportHistory(event)}
          />
          <div className="history-import-export">
            <button
              type="button"
              className="history-tool-button"
              disabled={sessions.length === 0}
              title={
                sessions.length === 0
                  ? "Start a chat before exporting history"
                  : "Export chat history as JSON"
              }
              onClick={handleExportHistory}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                file_download
              </span>
              Export History
            </button>
            <button
              type="button"
              className="history-tool-button"
              onClick={handleImportHistoryClick}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                upload_file
              </span>
              Import History
            </button>
          </div>
          <label className="history-search">
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
            />
          </label>
        </div>
      </header>

      <div className="history-list">
        {groupedSessions.length === 0 ? (
          <div className="history-empty">
            <span className="material-symbols-outlined" aria-hidden="true">
              history
            </span>
            <h2>No saved chats yet</h2>
            <p>Your saved conversations will appear here after you start a chat.</p>
          </div>
        ) : (
          groupedSessions.map((group) => (
            <section className="history-group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="history-group-list">
                {group.sessions.map((session) => {
                  const preview = getMessagePreview(session.messages);
                  const totalSessionTokens = getTotalTokens(session.messages);
                  const model = formatSessionModelSummary(session);
                  const compactModel = formatCompactSessionModelSummary(session);
                  const modelTitle = getSessionModelNames(session).join(", ");

                  return (
                    <article className="history-card" key={session.chatId}>
                      <button
                        type="button"
                        className="history-card-main"
                        onClick={() => onOpenChat(session.chatId)}
                      >
                        <span
                          className="material-symbols-outlined history-card-dot"
                          aria-hidden="true"
                        >
                          circle
                        </span>
                        <span className="history-card-text">
                          <span className="history-card-title">
                            {session.chatTitle || "New Chat"}
                          </span>
                          <span className="history-card-preview">
                            {preview}
                          </span>
                          <span className="history-card-meta">
                            <span
                              className="history-card-models"
                              title={modelTitle}
                            >
                              <span className="history-card-models-full">
                                {model}
                              </span>
                              <span className="history-card-models-compact">
                                {compactModel}
                              </span>
                            </span>
                            <span>{session.messages.length} messages</span>
                            {totalSessionTokens > 0 && (
                              <span>{formatNumber(totalSessionTokens)} tokens</span>
                            )}
                          </span>
                        </span>
                      </button>

                      <div className="history-card-side">
                        <div className="history-card-actions">
                          <button
                            type="button"
                            aria-label="Copy chat link"
                            onClick={(event) =>
                              handleCopyLink(event, session.chatId)
                            }
                          >
                            <span
                              className="material-symbols-outlined"
                              aria-hidden="true"
                            >
                              content_copy
                            </span>
                          </button>
                          <button
                            type="button"
                            className="danger"
                            aria-label="Delete saved chat"
                            onClick={(event) =>
                              handleRequestDelete(event, session)
                            }
                          >
                            <span
                              className="material-symbols-outlined"
                              aria-hidden="true"
                            >
                              delete
                            </span>
                          </button>
                        </div>
                        <span className="history-card-time">
                          {formatHistoryTime(getSessionDate(session))}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <footer className="history-footer">
        {formatNumber(filteredSessions.length)} conversations
        {" • "}
        {formatNumber(totalTokens)} total tokens used
        {" • "}
        {formatNumber(modelNames.size)} models
      </footer>

      {pendingDeleteSession && (
        <DeleteChatModal
          chatTitle={pendingDeleteSession.chatTitle}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}

      {toastMessage && (
        <DynamicIslandToast
          title={toastMessage.title}
          subtitle={toastMessage.subtitle}
        />
      )}
    </section>
  );
}

export default HistoryChat;
