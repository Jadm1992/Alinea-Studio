import { GoogleGenAI } from "@google/genai";

export function getPrimaryClient(apiKeys?: any): GoogleGenAI {
  const apiKey = apiKeys?.gemini || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets or in the Model Settings panel.");
  
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
}

export function getProviderDetails(model: string, apiKeys: any) {
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

export function formatOpenAIMessages(message: string, images: string[], history: any[], systemInstruction?: string) {
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

export function formatAnthropicMessages(message: string, images: string[], history: any[]) {
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
