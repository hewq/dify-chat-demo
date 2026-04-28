type ChatInputProps = {
  value: string
  loading: boolean
  onChange: (value: string) => void
  onSend: () => void
  onClear: () => void
  onStop: () => void
}

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
        <button className="chat-input-attach" aria-hidden="true" tabIndex={-1}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 1 1 5.65 5.66l-9.2 9.19a2 2 0 1 1-2.82-2.83l8.48-8.48" />
          </svg>
        </button>

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend()
            }
          }}
          placeholder="输入您的问题，例如：如何优化 React 渲染性能？"
          rows={1}
          disabled={loading}
        />

        <div className="chat-input-actions">
          <button className="secondary" onClick={onClear} disabled={loading}>
            清空会话
          </button>
          {loading ? (
            <button className="primary stop" onClick={() => onStop()}>
              <span className="stop-square" aria-hidden="true" />
            </button>
          ) : (
            <button className="primary send" onClick={() => onSend()}>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
