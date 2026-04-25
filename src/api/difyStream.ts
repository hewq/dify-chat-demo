export type RetrieverResource = {
  dataset_name?: string;
  document_name?: string;
  content?: string;
};

export type StreamCallbacks = {
  onMessage: (text: string) => void;
  onConversationId?: (conversationId: string) => void;
  onSources?: (sources: RetrieverResource[]) => void;
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

  if (!response.ok) {
    throw new Error(await extractResponseError(response));
  }

  if (!response.body) {
    throw new Error("The server did not return a readable stream.");
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
        const data = JSON.parse(jsonStr) as Record<string, unknown>;

        if (data.event === "message" && typeof data.answer === "string") {
          callbacks.onMessage(data.answer);
        }

        if (typeof data.conversation_id === "string") {
          callbacks.onConversationId?.(data.conversation_id);
        }

        if (data.event === "error") {
          callbacks.onError?.(
            new Error(
              typeof data.message === "string" && data.message.trim()
                ? data.message
                : "Dify stream error",
            ),
          );
        }

        if (data.event === "message_end") {
          const sources = extractRetrieverResources(data);

          if (sources.length > 0) {
            callbacks.onSources?.(sources);
          }
        }
      } catch {
        // Ignore non-JSON SSE lines.
      }
    }
  }
}

async function extractResponseError(response: Response) {
  const text = await response.text();

  if (!text) {
    return `Request failed with status ${response.status}.`;
  }

  try {
    const data = JSON.parse(text) as Record<string, unknown>;

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  } catch {
    return text;
  }

  return `Request failed with status ${response.status}.`;
}

function extractRetrieverResources(data: Record<string, unknown>) {
  const metadata = data.metadata;
  if (!metadata || typeof metadata !== "object") {
    return [];
  }

  const record = metadata as Record<string, unknown>;
  const resources = record.retriever_resources;
  if (!Array.isArray(resources)) {
    return [];
  }

  return resources.filter(isRetrieverResource);
}

function isRetrieverResource(value: unknown): value is RetrieverResource {
  return !!value && typeof value === "object";
}
