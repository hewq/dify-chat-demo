import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
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
            <path d="M12 3v3" />
            <rect x="5" y="8" width="14" height="10" rx="3" />
            <path d="M9 8V7a3 3 0 0 1 6 0v1" />
            <path d="M8 18v2" />
            <path d="M16 18v2" />
            <path d="M9 12h.01" />
            <path d="M15 12h.01" />
            <path d="M9 15h6" />
          </svg>
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
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
        </div>
      )}
    </div>
  );
}
