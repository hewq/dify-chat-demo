import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { Source } from "../types/chat";
import { SourceList } from "./SourceList";

type ChatMessageProps = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

function stripThinkContent(content: string) {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/gi, "")
    .trim();
}

export function ChatMessage({ role, content, sources }: ChatMessageProps) {
  const isUser = role === "user";
  const displayContent = isUser ? content : stripThinkContent(content);
  const timeLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());

  return (
    <div className={`message-row ${isUser ? "message-row-user" : ""}`}>
      {!isUser && (
        <div className="message-avatar assistant" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="7" width="16" height="11" rx="2.5" />
            <path d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
            <path d="M4 11.5h16" />
            <path d="M9.5 11.5v2" />
            <path d="M14.5 11.5v2" />
            <path d="M8.5 15.5h7" />
            <path d="M11 9.5h2" />
          </svg>
        </div>
      )}

      <div className={`message-stack ${isUser ? "user" : "assistant"}`}>
        {!isUser && (
          <div className="message-meta-bar">
            <span className="message-chip blue">DEEPSEEK-V3</span>
            <span className="message-chip green">PROCESSING</span>
          </div>
        )}

        <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
          {isUser ? (
            <div className="message-text">{displayContent}</div>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}

          {!isUser && sources && sources.length > 0 && (
            <SourceList sources={sources} />
          )}
        </div>
      </div>

      {isUser && (
        <div className="message-avatar user" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8.5" r="3.2" />
            <path d="M6.5 18.5c.9-2.7 3-4 5.5-4s4.6 1.3 5.5 4" />
            <path d="M5 19h14" />
          </svg>
        </div>
      )}
    </div>
  );
}
