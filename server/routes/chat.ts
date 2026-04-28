import { Router } from "express";
import { sendDifyBlocking, sendDifyStreaming } from "../services/dify";
import { getErrorMessage, sendError } from "../utils/errors";

export const chatRouter = Router();

chatRouter.post("/chat", async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== "string") {
      return sendError(res, 400, "message is required");
    }

    const data = await sendDifyBlocking({
      message,
      conversationId,
    });

    return res.json({
      answer: data.answer,
      conversationId: data.conversation_id,
      raw: data,
    });
  } catch (error) {
    console.error("[POST /api/chat]", error);

    return sendError(res, 500, "Internal server error", getErrorMessage(error));
  }
});

chatRouter.post("/chat/stream", async (req, res) => {
  const controller = new AbortController();

  req.on("aborted", () => {
    controller.abort();
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== "string") {
      return sendError(res, 400, "message is required");
    }

    const difyResponse = await sendDifyStreaming({
      message,
      conversationId,
      signal: controller.signal,
    });

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const reader = difyResponse.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    if (controller.signal.aborted) {
      return;
    }

    console.error("[POST /api/chat/stream]", error);

    if (!res.headersSent) {
      return sendError(
        res,
        500,
        "Internal server error",
        getErrorMessage(error),
      );
    }

    res.write(
      `data: ${JSON.stringify({
        event: "error",
        message: getErrorMessage(error),
      })}\n\n`,
    );
    res.end();
  }
});
