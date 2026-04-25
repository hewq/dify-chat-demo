type ChatInputProps = {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
};

export function ChatInput({
  value,
  loading,
  onChange,
  onSend,
  onClear,
}: ChatInputProps) {
  return (
    <div className="chat-input-bar">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        placeholder="输入你的问题，按 Enter 发送，Shift + Enter 换行"
        rows={3}
        disabled={loading}
      />

      <div className="chat-input-action">
        <button onClick={onClear} disabled={loading}>
          清空会话
        </button>
        <button onClick={onSend} disabled={loading || value.trim() === ""}>
          {loading ? "回答中..." : "发送"}
        </button>
      </div>
    </div>
  );
}
