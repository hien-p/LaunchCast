import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { episodesRouter } from "./routes/episodes.js";
import { generateRouter } from "./routes/generate.js";

const app = express();

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Routes
app.use("/api/episodes", episodesRouter);
app.use("/api/generate", generateRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(config.port, () => {
  console.log(`LaunchCast backend running on http://localhost:${config.port}`);
});
