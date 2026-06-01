import { Router } from "express";
import fs from "fs/promises";
import path from "path";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await fs.readFile(path.join(process.cwd(), "data", "quotes.json"), "utf-8");
    res.json(JSON.parse(data));
  } catch (err: any) {
    console.error("Error reading quotes.json:", err);
    res.status(500).json({ error: "Failed to load quotes data" });
  }
});

router.get("/random", async (req, res) => {
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

export default router;
