import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DIFY_API_URL =
  process.env.DIFY_API_URL || "https://api.dify.ai/v1/chat-messages";

if (!DIFY_API_KEY) {
  throw new Error("Missing DIFY_API_KEY in .env");
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const difyResponse = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: "blocking",
        conversation_id: conversationId || "",
        user: "vite-demo-user",
      }),
    });

    if (!difyResponse.ok) {
      const errorText = await difyResponse.text();
      return res.status(difyResponse.status).json({
        error: "Dify API request failed",
        detail: extractDifyErrorMessage(errorText),
      });
    }

    const data = await difyResponse.json();

    return res.json({
      answer: data.answer,
      conversationId: data.conversation_id,
      raw: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.post("/api/chat/stream", async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const controller = new AbortController();

    req.on("aborted", () => {
      controller.abort();
    });

    res.on("close", () => {
      if (!res.writableEnded) {
        controller.abort();
      }
    });

    res.on("finish", () => {
      controller.abort();
    });

    const difyResponse = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query: message,
        response_mode: "streaming",
        conversation_id: conversationId || "",
        user: "vite-demo-user",
      }),
      signal: controller.signal,
    });

    if (!difyResponse.ok || !difyResponse.body) {
      const errorText = await difyResponse.text();
      return res.status(difyResponse.status).json({
        error: "Dify API stream request failed",
        detail: extractDifyErrorMessage(errorText),
      });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const reader = difyResponse.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (!res.headersSent) {
        res.status(499).json({
          error: "Client closed request",
        });
      }
      return;
    }

    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Internal server error",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
});

app.listen(3001, () => {
  console.log("API server running at http://localhost:3001");
});

function extractDifyErrorMessage(errorText: string) {
  if (!errorText) {
    return "Unknown Dify API error.";
  }

  try {
    const data = JSON.parse(errorText) as Record<string, unknown>;

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  } catch {
    return errorText;
  }

  return errorText;
}
