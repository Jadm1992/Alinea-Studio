import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import chatRouter from "./server/routes/chat";
import quotesRouter from "./server/routes/quotes";
import ttsRouter from "./server/routes/tts";
import imageRouter from "./server/routes/image";

dotenv.config();

const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "connect-src": ["'self'", "ws:", "wss:", "https:"],
      "media-src": ["'self'", "blob:"],
      "img-src": ["'self'", "data:", "blob:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.set('trust proxy', 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

app.use("/generated", express.static(path.join(process.cwd(), "generated")));

const PORT = process.env.PORT || 3000;

app.use("/api/quote", quotesRouter);
app.use("/api/quotes", quotesRouter);
app.use("/api/chat", chatRouter);
app.use("/api/tts", ttsRouter);
app.use("/api/generate-image", imageRouter);

async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
});
