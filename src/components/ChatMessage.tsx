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
  );
}
