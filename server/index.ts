import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { chatRouter } from "./routes/chat";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
  });
});

app.use("/api", chatRouter);

app.listen(env.port, () => {
  console.log(`API server running at http://localhost:${env.port}`);
});
