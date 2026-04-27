import type { ChatSession } from "../types/chat";

type SidebarProps = {
  sessions: ChatSession[];
  activeSessionId?: string;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
};

function formatSessionTime(updatedAt: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(updatedAt);
}

export function Sidebar({
  sessions,
  activeSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-kicker">Workspace</span>
        <h2>会话列表</h2>
        <p>管理历史问题与当前聊天上下文</p>
      </div>

      <button className="new-chat-button" onClick={onNewSession}>
        <span className="new-chat-icon">+</span>
        <span>新建会话</span>
      </button>

      <div className="session-list">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`session-item ${
              session.id === activeSessionId ? "active" : ""
            }`}
          >
            <button
              className="session-title"
              onClick={() => onSelectSession(session.id)}
              title={session.title}
            >
              <span className="session-title-text">{session.title}</span>
              <span className="session-meta">
                {formatSessionTime(session.updatedAt)}
              </span>
            </button>

            <button
              className="session-delete"
              onClick={() => onDeleteSession(session.id)}
              title="删除会话"
              aria-label={`删除会话 ${session.title}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
