import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { EdgeTTS } from "node-edge-tts";
import os from "os";

dotenv.config();

const app = express();
app.use(helmet());
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

app.get("/api/quote", async (req, res) => {
  try {
    const rawData = await fs.readFile(path.join(process.cwd(), "data", "quotes.json"), "utf8");
    const quotes = JSON.parse(rawData);
    
    if (quotes?.data?.length > 0) {
      const randomQuote = quotes.data[Math.floor(Math.random() * quotes.data.length)].attributes;
      res.json(randomQuote);
    } else {
      res.status(404).json({ error: "No quotes found" });
    }
  } catch (err) {
    console.error("Failed to read quotes:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function getPrimaryClient(apiKeys?: any): GoogleGenAI {
  const apiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets or in the Model Settings panel.");
  
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

function getProviderDetails(model: string, apiKeys: any) {
  let provider = "gemini";
  let cleanModel = model;

  if (model.startsWith("openrouter/")) {
    provider = "openrouter";
    cleanModel = model.substring(11);
  } else if (model.startsWith("azure/")) {
    provider = "azure";
    cleanModel = model.substring(6);
  } else if (model.startsWith("local/")) {
    provider = "local";
    cleanModel = model.substring(6);
  } else if (model.startsWith("gpt-")) {
    provider = "openai";
  } else if (model.startsWith("deepseek-")) {
    provider = "deepseek";
  } else if (model.startsWith("claude-")) {
    provider = "anthropic";
  } else if (model.includes("/")) {
    const parts = model.split("/");
    const possibleProvider = parts[0].toLowerCase();
    if (["gemini", "openrouter", "openai", "deepseek", "anthropic", "local", "azure"].includes(possibleProvider)) {
      provider = possibleProvider;
      cleanModel = parts.slice(1).join("/");
    }
  }

  let apiKey = "";
  let endpoint = "";

  if (provider === "gemini") {
    apiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY || "";
  } else if (provider === "openrouter") {
    apiKey = apiKeys?.openrouter || process.env.OPENROUTER_API_KEY || "";
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
  } else if (provider === "openai") {
    apiKey = apiKeys?.openai || process.env.OPENAI_API_KEY || "";
    endpoint = "https://api.openai.com/v1/chat/completions";
  } else if (provider === "local") {
    apiKey = "ollama";
    endpoint = process.env.LOCAL_API_ENDPOINT || "http://127.0.0.1:11434/v1/chat/completions";
  } else if (provider === "deepseek") {
    apiKey = apiKeys?.deepseek || process.env.DEEPSEEK_API_KEY || "";
    endpoint = "https://api.deepseek.com/chat/completions";
  } else if (provider === "anthropic") {
    apiKey = apiKeys?.anthropic || process.env.ANTHROPIC_API_KEY || "";
    endpoint = "https://api.anthropic.com/v1/messages";
  } else if (provider === "azure") {
    apiKey = process.env.AZURE_API_KEY || "";
    endpoint = process.env.AZURE_API_ENDPOINT || "";

    if (endpoint && !endpoint.includes("/chat/completions")) {
      endpoint = endpoint.replace(/\/$/, "") + "/chat/completions";
    }

    if (cleanModel === "ai") {
      cleanModel = process.env.AZURE_MODEL_NAME || "gpt-5.4-pro";
    }
  }

  return { provider, cleanModel, apiKey, endpoint };
}

function formatOpenAIMessages(message: string, images: string[], history: any[], systemInstruction?: string) {
  const openAIMessages = [];

  if (systemInstruction) {
    openAIMessages.push({ role: "system", content: systemInstruction });
  }

  if (history && Array.isArray(history)) {
    for (const h of history) {
      const role = h.role === 'user' ? 'user' : 'assistant';
      if (h.images && Array.isArray(h.images) && h.images.length > 0) {
        const content: any[] = [{ type: "text", text: h.text || "" }];
        for (const img of h.images) {
          content.push({ type: "image_url", image_url: { url: img } });
        }
        openAIMessages.push({ role, content });
      } else {
        openAIMessages.push({ role, content: h.text || "" });
      }
    }
  }

  if (images && Array.isArray(images) && images.length > 0) {
    const currentContent: any[] = [{ type: "text", text: message || "" }];
    for (const img of images) {
      currentContent.push({ type: "image_url", image_url: { url: img } });
    }
    openAIMessages.push({ role: "user", content: currentContent });
  } else {
    openAIMessages.push({ role: "user", content: message || "" });
  }

  return openAIMessages;
}

function formatAnthropicMessages(message: string, images: string[], history: any[]) {
  const anthropicMessages = [];

  if (history && Array.isArray(history)) {
    for (const h of history) {
      const role = h.role === 'user' ? 'user' : 'assistant';

      if (h.images && Array.isArray(h.images) && h.images.length > 0) {
        const content: any[] = [];
        for (const img of h.images) {
          const match = img.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
          if (match) {
            content.push({
              type: "image",
              source: { type: "base64", media_type: match[1], data: match[2] }
            });
          }
        }
        content.push({ type: "text", text: h.text || "" });
        anthropicMessages.push({ role, content });
      } else {
        anthropicMessages.push({ role, content: h.text || "" });
      }
    }
  }

  if (images && Array.isArray(images) && images.length > 0) {
    const currentContent: any[] = [];
    for (const img of images) {
      const match = img.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
      if (match) {
        currentContent.push({
          type: "image",
          source: { type: "base64", media_type: match[1], data: match[2] }
        });
      }
    }
    currentContent.push({ type: "text", text: message || "" });
    anthropicMessages.push({ role: "user", content: currentContent });
  } else {
    anthropicMessages.push({ role: "user", content: message || "" });
  }

  const filteredAnthropicMessages: any[] = [];
  for (const msg of anthropicMessages) {
    if (filteredAnthropicMessages.length === 0) {
      if (msg.role === 'user') {
        filteredAnthropicMessages.push(msg);
      }
    } else {
      const lastMsg = filteredAnthropicMessages[filteredAnthropicMessages.length - 1];
      if (lastMsg.role === msg.role) {
        if (typeof lastMsg.content === 'string' && typeof msg.content === 'string') {
          lastMsg.content += "\n" + msg.content;
        } else {
          const c1 = typeof lastMsg.content === 'string' ? [{ type: 'text', text: lastMsg.content }] : lastMsg.content;
          const c2 = typeof msg.content === 'string' ? [{ type: 'text', text: msg.content }] : msg.content;
          lastMsg.content = [...c1, ...c2];
        }
      } else {
        filteredAnthropicMessages.push(msg);
      }
    }
  }

  return filteredAnthropicMessages;
}

app.post("/api/chat", async (req, res) => {
  try {
    const { model, message, images, history, systemInstruction, temperature, apiKeys } = req.body;
    const formattedModel = model || "gemini-3.5-flash";

    const { provider, cleanModel, apiKey, endpoint } = getProviderDetails(formattedModel, apiKeys);

    if (!apiKey) {
      throw new Error(`The API key for provider "${provider.toUpperCase()}" is not configured. Please click the Settings gear icon to add your custom API Key!`);
    }

    if (provider === "gemini") {
      const ai = getPrimaryClient(apiKeys);
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          const parts = [];
          if (msg.images && Array.isArray(msg.images)) {
            for (const img of msg.images) {
              const match = img.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
              if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }
          parts.push({ text: msg.text || "" });
          contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: parts });
        }
      }

      while (contents.length > 0 && contents[0].role !== 'user') contents.shift();

      const currentParts = [];
      if (images && Array.isArray(images)) {
        for (const img of images) {
          const match = img.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
          if (match) currentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      currentParts.push({ text: message || "" });
      contents.push({ role: 'user', parts: currentParts });

      const response = await ai.models.generateContent({
        model: cleanModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: temperature !== undefined ? Number(temperature) : undefined,
        }
      });

      res.json({ text: response.text });
      return;
    }

    if (provider === "anthropic") {
      const anthropicMsg = formatAnthropicMessages(message, images || [], history || []);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          model: cleanModel,
          max_tokens: 4000,
          system: systemInstruction || undefined,
          messages: anthropicMsg,
          temperature: temperature !== undefined ? Number(temperature) : undefined
        })
      });

      if (!response.ok) throw new Error(`Anthropic error (${response.status}): ${await response.text()}`);

      const parsed: any = await response.json();
      res.json({ text: parsed.content?.[0]?.text || "" });
    } else {
      const oaiMessages = formatOpenAIMessages(message, images || [], history || [], systemInstruction);
      const isAzureOpenAI = endpoint.includes("openai.azure.com");
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isAzureOpenAI ? { "api-key": apiKey } : { "Authorization": `Bearer ${apiKey}` }),
          ...(provider === "openrouter" ? { "HTTP-Referer": "https://ai.studio/build", "X-Title": "Chat Studio" } : {})
        },
        body: JSON.stringify({
          model: cleanModel,
          messages: oaiMessages,
          temperature: temperature !== undefined ? Number(temperature) : undefined
        })
      });

      if (!response.ok) throw new Error(`${provider.toUpperCase()} error (${response.status}): ${await response.text()}`);

      const parsed: any = await response.json();
      res.json({ text: parsed.choices?.[0]?.message?.content || "" });
    }
  } catch (err: any) {
    console.error("Error in /api/chat:", err);
    const msg = err.message && err.message.includes("is not configured") ? err.message : "An error occurred while processing your request.";
    res.status(500).json({ error: msg });
  }
});

app.post("/api/chat/stream", async (req, res) => {
  try {
    const { model, message, images, history, systemInstruction, temperature, apiKeys } = req.body;
    const formattedModel = model || "gemini-3.5-flash";

    const { provider, cleanModel, apiKey, endpoint } = getProviderDetails(formattedModel, apiKeys);

    if (!apiKey) {
      throw new Error(`The API key for provider "${provider.toUpperCase()}" is not configured. Please click the Settings gear icon to add your custom API Key!`);
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    });

    if (provider === "gemini") {
      const ai = getPrimaryClient(apiKeys);
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          const parts = [];
          if (msg.images && Array.isArray(msg.images)) {
            for (const img of msg.images) {
              const match = img.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
              if (match) parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }
          parts.push({ text: msg.text || "" });
          contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts: parts });
        }
      }

      while (contents.length > 0 && contents[0].role !== 'user') contents.shift();

      const currentParts = [];
      if (images && Array.isArray(images)) {
        for (const img of images) {
          const match = img.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
          if (match) currentParts.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      currentParts.push({ text: message || "" });
      contents.push({ role: 'user', parts: currentParts });

      const stream = await ai.models.generateContentStream({
        model: cleanModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: temperature !== undefined ? Number(temperature) : undefined,
        }
      });

      for await (const chunk of stream) {
        if (chunk.text) res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }

      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }

    let body = {};
    let headers: Record<string, string> = {};

    if (provider === "anthropic") {
      const anthropicMsg = formatAnthropicMessages(message, images || [], history || []);
      headers = {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      };
      body = {
        model: cleanModel,
        max_tokens: 4000,
        system: systemInstruction || undefined,
        messages: anthropicMsg,
        temperature: temperature !== undefined ? Number(temperature) : undefined,
        stream: true
      };
    } else {
      const oaiMessages = formatOpenAIMessages(message, images || [], history || [], systemInstruction);
      const isAzureEndpoint = endpoint.includes("azure.com");
      headers = {
        "Content-Type": "application/json",
        ...(isAzureEndpoint ? { "api-key": apiKey } : { "Authorization": `Bearer ${apiKey}` }),
        ...(provider === "openrouter" ? { "HTTP-Referer": "https://ai.studio/build", "X-Title": "Chat Studio" } : {})
      };
      body = {
        model: cleanModel,
        messages: oaiMessages,
        max_tokens: 8000,
        temperature: temperature !== undefined ? Number(temperature) : undefined,
        stream: true
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${provider.toUpperCase()} stream error (${response.status}): ${errorText}`);
      res.write(`data: ${JSON.stringify({ error: "An error occurred with the upstream provider." })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body;
    if (!reader) {
      res.write(`data: ${JSON.stringify({ error: "Stream unavailable from provider" })}\n\n`);
      res.end();
      return;
    }

    const decoder = new TextDecoder("utf-8");
    let lineBuffer = "";

    for await (const chunk of reader as any) {
      const decodedText = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
      lineBuffer += decodedText;
      const lines = lineBuffer.split("\n");
      lineBuffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("data: ")) {
          const dataStr = trimmed.substring(6).trim();
          if (dataStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(dataStr);
            let textToken = "";

            if (provider === "anthropic") {
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                textToken = parsed.delta.text;
              } else if (parsed.delta?.text) {
                textToken = parsed.delta.text;
              }
            } else {
              textToken = parsed.choices?.[0]?.delta?.content || "";
            }

            if (textToken) res.write(`data: ${JSON.stringify({ text: textToken })}\n\n`);
          } catch (e) {}
        }
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err: any) {
    console.error("Error in /api/chat/stream:", err);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/event-stream" });
    const msg = err.message && err.message.includes("is not configured") ? err.message : "An error occurred while streaming your request.";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required for TTS generation." });

    const tts = new EdgeTTS({ voice: "en-US-AriaNeural" });
    const audioPath = path.join(os.tmpdir(), `tts-${Date.now()}.mp3`);
    
    await tts.ttsPromise(text, audioPath);
    const audioBuffer = await fs.readFile(audioPath);
    fs.unlink(audioPath).catch(err => console.error("Failed to delete temp audio:", err));

    res.set("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (err: any) {
    console.error("Error in /api/tts:", err);
    res.status(500).json({ error: "Internal Server Error communicating with TTS" });
  }
});

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const apiKey = process.env.AZURE_API_KEY;
    const deploymentName = process.env.AZURE_IMAGE_DEPLOYMENT_NAME || "flux-2-pro";
    
    let url = process.env.AZURE_IMAGE_ENDPOINT;
    if (!url) {
      url = `https://alinea-foundry-app.openai.azure.com/openai/deployments/${deploymentName}/images/generations?api-version=2024-02-01`;
    }

    if (!apiKey) return res.status(500).json({ error: "Azure API key is missing" });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: deploymentName,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        width: 1024,
        height: 1024,
        output_format: "jpeg"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure Image Gen Error:", errorText);
      return res.status(response.status).json({ error: "An error occurred during image generation." });
    }

    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const imageData = data.data[0];
      if (imageData.b64_json) {
        const buffer = Buffer.from(imageData.b64_json, "base64");
        const generatedDir = path.join(process.cwd(), "generated");
        await fs.mkdir(generatedDir, { recursive: true });
        const filename = `flux_${Date.now()}.jpeg`;
        await fs.writeFile(path.join(generatedDir, filename), buffer);
        
        res.json({ imageUrl: `/generated/${filename}` });
      } else if (imageData.url) {
        res.json({ imageUrl: imageData.url });
      } else {
        res.status(500).json({ error: "No image URL or base64 data returned from Azure" });
      }
    } else {
      res.status(500).json({ error: "No image data returned from Azure" });
    }

  } catch (err: any) {
    console.error("Error in /api/generate-image:", err);
    res.status(500).json({ error: "Internal Server Error during image generation" });
  }
});

app.get("/api/quotes", async (req, res) => {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data", "quotes.json"), "utf-8");
    res.json(JSON.parse(data));
  } catch (err: any) {
    console.error("Error reading quotes.json:", err);
    res.status(500).json({ error: "Failed to load quotes data" });
  }
});

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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
});