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

export function ChatMessage({ role, content, sources }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row-user" : ""}`}>
      {!isUser && <div className="message-avatar assistant">AI</div>}
      <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
        <div className="message-role">{isUser ? "你" : "AI Assistant"}</div>
        {isUser ? (
          <div className="message-text">{content}</div>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && sources && sources.length > 0 && (
          <SourceList sources={sources} />
        )}
      </div>
      {isUser && <div className="message-avatar user">你</div>}
    </div>
  );
}
