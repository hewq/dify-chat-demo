export type StreamCallbacks = {
  onMessage: (text: string) => void;
  onConversationId?: (conversationId: string) => void;
  onError?: (error: Error) => void;
  onDone?: () => void;
};

export async function sendMessageToDifyStream(
  message: string,
  conversationId: string | undefined,
  callbacks: StreamCallbacks,
) {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      conversationId,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error("请求失败");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      callbacks.onDone?.();
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) continue;

      const jsonStr = trimmed.replace(/^data:\s*/, "");

      if (jsonStr === "[DONE]") {
        callbacks.onDone?.();
        return;
      }

      try {
        const data = JSON.parse(jsonStr);

        if (data.event === "message" && data.answer) {
          callbacks.onMessage(data.answer);
        }

        if (data.conversation_id) {
          callbacks.onConversationId?.(data.conversation_id);
        }

        if (data.event === "error") {
          callbacks.onError?.(new Error(data.message || "Dify stream error"));
        }
      } catch {
        // 忽略非 JSON 行
      }
    }
  }
}
