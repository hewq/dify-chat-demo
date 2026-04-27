import { useMemo, useState } from "react";
import type { ChatSession } from "../types/chat";

type SidebarProps = {
  sessions: ChatSession[];
  activeSessionId?: string;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
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
  onRenameSession,
}: SidebarProps) {
  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const filteredSessions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return sessions
      .filter((session) => {
        if (!normalizedKeyword) return true;
        return session.title.toLowerCase().includes(normalizedKeyword);
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [sessions, keyword]);

  function startEdit(session: ChatSession) {
    setEditingId(session.id);
    setEditingTitle(session.title);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  function submitEdit(sessionId: string) {
    const title = editingTitle.trim();

    if (title) {
      onRenameSession(sessionId, title);
    }

    cancelEdit();
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">AI</div>
        <div className="sidebar-brand-copy">
          <strong>AI Workspace</strong>
          <span>Conversations</span>
        </div>
      </div>

      <button className="new-chat-button" onClick={onNewSession}>
        <span>新建会话</span>
      </button>

      <div className="session-search-shell">
        <span className="session-search-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          className="session-search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索会话..."
        />
      </div>

      <div className="session-section-label">Recent Chats</div>

      <div className="session-list">
        {filteredSessions.length === 0 ? (
          <div className="session-empty">没有匹配的会话</div>
        ) : (
          filteredSessions.map((session) => {
            const isEditing = editingId === session.id;

            return (
              <div
                key={session.id}
                className={`session-item ${
                  session.id === activeSessionId ? "active" : ""
                }`}
              >
                {isEditing ? (
                  <input
                    className="session-edit-input"
                    value={editingTitle}
                    autoFocus
                    onChange={(event) => setEditingTitle(event.target.value)}
                    onBlur={() => submitEdit(session.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        submitEdit(session.id);
                      }

                      if (event.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                  />
                ) : (
                  <button
                    className="session-title"
                    onClick={() => onSelectSession(session.id)}
                    onDoubleClick={() => startEdit(session)}
                    title="双击重命名"
                  >
                    <span className="session-title-text">{session.title}</span>
                    <span className="session-meta">
                      {formatSessionTime(session.updatedAt)}
                    </span>
                  </button>
                )}

                <button
                  className="session-delete"
                  onClick={() => onDeleteSession(session.id)}
                  title="删除会话"
                  aria-label={`删除会话 ${session.title}`}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-footer-link">
          <span className="sidebar-footer-icon" aria-hidden="true">
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
              <circle cx="12" cy="12" r="9" />
              <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4" />
              <path d="M12 17h.01" />
            </svg>
          </span>
          <span>Help</span>
        </button>
        <button className="sidebar-footer-link">
          <span className="sidebar-footer-icon" aria-hidden="true">
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
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-4 12.75A4 4 0 0 1 9.5 18h5a4 4 0 0 1 1.5-3.25A7 7 0 0 0 12 2Z" />
              <path d="M9 10a3 3 0 0 1 6 0c0 1.5-1 2.2-2 2.8" />
            </svg>
          </span>
          <span>Support</span>
        </button>
        <button className="sidebar-footer-link">
          <span className="sidebar-footer-icon" aria-hidden="true">
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
            </svg>
          </span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
