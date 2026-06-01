import { Router } from "express";
import { EdgeTTS } from "node-edge-tts";
import path from "path";
import os from "os";
import fs from "fs/promises";

const router = Router();

router.post("/", async (req, res) => {
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

export default router;
