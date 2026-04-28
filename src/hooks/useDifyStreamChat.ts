import { useRef, useState } from "react";
import { sendMessageToDifyStream } from "../api/difyStream";
import type { Message } from "../types/chat";

type UseDifyStreamChatOptions = {
  getMessages: () => Message[];
  getConversationId: () => string | undefined;
  setMessages: (updater: (messages: Message[]) => Message[]) => void;
  setConversationId: (conversationId: string | undefined) => void;
};

export function useDifyStreamChat({
  getMessages,
  getConversationId,
  setMessages,
  setConversationId,
}: UseDifyStreamChatOptions) {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  async function send(text: string) {
    const message = text.trim();

    if (!message || loading) return;

    setLoading(true);

    const currentMessages = getMessages();
    const assistantMessageIndex = currentMessages.length + 1;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await sendMessageToDifyStream(
        message,
        getConversationId(),
        {
          onMessage: (chunk) => {
            setMessages((prev) => {
              const next = [...prev];
              const current = next[assistantMessageIndex];

              if (current) {
                next[assistantMessageIndex] = {
                  ...current,
                  content: current.content + chunk,
                };
              }

              return next;
            });
          },
          onConversationId: (id) => {
            setConversationId(id);
          },
          onSources: (sources) => {
            setMessages((prev) => {
              const next = [...prev];
              const current = next[assistantMessageIndex];

              if (current) {
                next[assistantMessageIndex] = {
                  ...current,
                  sources: sources.map((source) => ({
                    datasetName: source.dataset_name,
                    documentName: source.document_name,
                    content: source.content,
                  })),
                };
              }

              return next;
            });
          },
          onError: (error) => {
            setMessages((prev) => {
              const next = [...prev];
              const current = next[assistantMessageIndex];

              if (current) {
                next[assistantMessageIndex] = {
                  ...current,
                  content: `请求失败：${error.message}`,
                };
              }

              return next;
            });
          },
          onDone: () => {
            setLoading(false);
            abortControllerRef.current = null;
          },
        },
        abortController.signal,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setMessages((prev) => {
        const next = [...prev];
        const current = next[assistantMessageIndex];

        if (current) {
          next[assistantMessageIndex] = {
            ...current,
            content:
              error instanceof Error
                ? `请求失败：${error.message}`
                : "请求失败，请稍后重试。",
          };
        }

        return next;
      });

      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function stop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);

    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];

      if (last?.role === "assistant" && last.content.trim()) {
        next[next.length - 1] = {
          ...last,
          content: `${last.content}\n\n_已停止生成_`,
        };
      }

      if (last?.role === "assistant" && !last.content.trim()) {
        next[next.length - 1] = {
          ...last,
          content: "_已停止生成_",
        };
      }

      return next;
    });
  }

  return {
    loading,
    send,
    stop,
  };
}
