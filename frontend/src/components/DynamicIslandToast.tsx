type DynamicIslandToastProps = {
  title?: string;
  subtitle?: string;
};

function DynamicIslandToast({
  title = "History chat deleted",
  subtitle = "Conversation removed from your history",
}: DynamicIslandToastProps) {
  return (
    <div className="history-delete-toast" role="status" aria-live="polite">
      <span>{title}</span>
      {subtitle && <small>{subtitle}</small>}
    </div>
  );
}

export default DynamicIslandToast;
