import { useEffect, useRef } from "react";
import type { Message } from "../types/chat";
import { ChatMessage } from "./ChatMessage";
import { EmptyState } from "./EmptyState";

type ChatWindowProps = {
  messages: Message[];
  loading: boolean;
};

export function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="chat-window">
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          role={message.role}
          content={message.content}
          sources={message.sources}
        />
      ))}
      {loading && <div className="typing">AI 正在生成回复...</div>}
      <div ref={bottomRef} />
    </div>
  );
}
