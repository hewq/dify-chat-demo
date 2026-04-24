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
        detail: errorText,
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
    });

    if (!difyResponse.ok || !difyResponse.body) {
      const errorText = await difyResponse.text();
      return res.status(difyResponse.status).json({
        error: "Dify API stream request failed",
        detail: errorText,
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
    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.listen(3001, () => {
  console.log("API server running at http://localhost:3001");
});
