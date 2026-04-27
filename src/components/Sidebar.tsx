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
      <div className="sidebar-header">
        <span className="sidebar-kicker">Workspace</span>
        <h2>会话列表</h2>
        <p>管理历史问题与当前聊天上下文</p>
      </div>

      <button className="new-chat-button" onClick={onNewSession}>
        <span className="new-chat-icon">+</span>
        <span>新建会话</span>
      </button>

      <div className="session-search-shell">
        <span className="session-search-icon" aria-hidden="true">
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
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          className="session-search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索会话"
        />
      </div>

      <div className="session-list-header">
        <span>最近会话</span>
        <strong>{filteredSessions.length}</strong>
      </div>

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
                <span className="session-accent" aria-hidden="true" />

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
    </aside>
  );
}
