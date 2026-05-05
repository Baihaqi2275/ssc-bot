import { useEffect } from "react";

type DeleteChatModalProps = {
  chatTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteChatModal({
  chatTitle,
  onCancel,
  onConfirm,
}: DeleteChatModalProps) {
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onCancel]);

  return (
    <div
      className="history-modal-backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="history-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-history-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-history-title">Delete conversation?</h2>
        <p>This action will permanently remove this chat from your history.</p>
        <div className="history-delete-preview">{chatTitle || "New Chat"}</div>
        <div className="history-delete-actions">
          <button
            type="button"
            className="history-cancel-delete"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="history-confirm-delete"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteChatModal;
