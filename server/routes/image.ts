import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const router = Router();

router.post("/", async (req, res) => {
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

export default router;
