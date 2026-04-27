type ChatInputProps = {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
  onStop: () => void;
};

export function ChatInput({
  value,
  loading,
  onChange,
  onSend,
  onClear,
  onStop,
}: ChatInputProps) {
  return (
    <div className="chat-input-bar">
      <div className="chat-input-shell">
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

        <div className="chat-input-meta">
          <span>面向前端知识问答与代码辅助</span>
          <span>Enter 发送</span>
        </div>

        <div className="chat-input-actions">
          <button className="secondary" onClick={onClear} disabled={loading}>
            清空会话
          </button>
          {loading ? (
            <button className="primary" onClick={() => onStop()}>
              停止生成
            </button>
          ) : (
            <button className="primary" onClick={() => onSend()}>
              发送消息
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
