import { env } from "../config/env";
import type { DifyBlockingResponse } from "../types/dify";

type SendBlockingParams = {
  message: string;
  conversationId?: string;
};

type SendStreamingParams = {
  message: string;
  conversationId?: string;
  signal?: AbortSignal;
};

function createDifyBody(message: string, conversationId?: string) {
  return {
    inputs: {},
    query: message,
    conversation_id: conversationId || "",
    user: env.difyUser,
  };
}

export async function sendDifyBlocking({
  message,
  conversationId,
}: SendBlockingParams): Promise<DifyBlockingResponse> {
  const response = await fetch(env.difyApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.difyApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...createDifyBody(message, conversationId),
      response_mode: "blocking",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dify request failed: ${errorText}`);
  }

  return response.json() as Promise<DifyBlockingResponse>;
}

export async function sendDifyStreaming({
  message,
  conversationId,
  signal,
}: SendStreamingParams) {
  const response = await fetch(env.difyApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.difyApiKey}`,
      "Content-Type": "application/json",
    },
    signal,
    body: JSON.stringify({
      ...createDifyBody(message, conversationId),
      response_mode: "streaming",
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(`Dify stream request failed: ${errorText}`);
  }

  return response;
}
