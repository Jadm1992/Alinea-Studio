import { Router } from "express";
import { getPrimaryClient, getProviderDetails, formatOpenAIMessages, formatAnthropicMessages } from "../providers";

const router = Router();

router.post("/", async (req, res) => {
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

router.post("/stream", async (req, res) => {
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

      const responseStream = await ai.models.generateContentStream({
        model: cleanModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction || undefined,
          temperature: temperature !== undefined ? Number(temperature) : undefined,
        }
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
    } else {
      let isAnthropic = provider === "anthropic";
      let requestBody: any = {
        model: cleanModel,
        temperature: temperature !== undefined ? Number(temperature) : undefined,
        stream: true
      };

      let headers: any = {
        "Content-Type": "application/json"
      };

      if (isAnthropic) {
        const anthropicMsg = formatAnthropicMessages(message, images || [], history || []);
        requestBody.max_tokens = 4000;
        if (systemInstruction) requestBody.system = systemInstruction;
        requestBody.messages = anthropicMsg;
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
      } else {
        const oaiMessages = formatOpenAIMessages(message, images || [], history || [], systemInstruction);
        requestBody.messages = oaiMessages;
        if (endpoint.includes("openai.azure.com")) {
          headers["api-key"] = apiKey;
        } else {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }
        if (provider === "openrouter") {
          headers["HTTP-Referer"] = "https://ai.studio/build";
          headers["X-Title"] = "Chat Studio";
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`${provider.toUpperCase()} error (${response.status}): ${await response.text()}`);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

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
    }

    res.end();

  } catch (err: any) {
    console.error("Error in /api/chat/stream:", err);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "text/event-stream" });
    const msg = err.message && err.message.includes("is not configured") ? err.message : "An error occurred while streaming your request.";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.end();
  }
});

export default router;
