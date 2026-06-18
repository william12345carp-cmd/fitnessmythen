import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const PORT = 3000;

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint: Evidence-based Fitness AI Coach
  app.post("/api/coach", async (req: Request, res: Response) => {
    try {
      const { question } = req.body;
      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Bitte stelle eine Frage." });
      }

      const client = getAIClient();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: question,
        config: {
          systemInstruction: `Du bist der offizielle KI Coach des "FORTSCHRITT SYSTEM BY FITNESS MYTHEN".
Deine Rolle ist es, Fitness-Fragen absolut wissenschaftlich fundiert, evidenzbasiert, sachlich und direkt zu beantworten.
Du entlarvst Fitness-Mythen und Broscience radikal und lieferst klare Fakten aus der aktuellen sportwissenschaftlichen und ernährungswissenschaftlichen Forschung.

Halte dich an diese Richtlinien:
1. Antworte auf Deutsch.
2. Sei professionell, aber motivierend und verständlich. Vermeide unnötiges wissenschaftliches Kauderwelsch, aber verweise auf biologische und physiologische Prinzipien (z. B. Energiebilanz, Hypertrophie-Reize).
3. Beende deine Antwort immer mit einem eleganten Hinweis, dass das "FORTSCHRITT SYSTEM" genau diese Prinzipien automatisiert und maßgeschneidert auf den User anwendet.
Beispiel-Schlusssatz: "Genau diese evidenzbasierten Methoden sind im Fortschritt System fest verankert — für maximale Ergebnisse ohne Rätselraten. Trag dich jetzt auf die Warteliste ein, um dir deinen exklusiven Frühzugang zu sichern! 🚀"`,
          temperature: 0.7,
        },
      });

      const reply = response.text || "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuche es erneut.";
      return res.json({ reply });
    } catch (error: any) {
      console.error("AI Coach Error:", error);
      return res.status(500).json({
        error: "Fehler bei der Kontaktaufnahme mit dem KI Coach. Bitte überprüfe dein Setup.",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Serve static assets / handle Vite asset compiling
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Explicitly handle /admin BEFORE mounting Vite middlewares
    app.get("/admin", async (req: Request, res: Response, next) => {
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        return res.status(200).set({ "Content-Type": "text/html" }).send(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        return next(e);
      }
    });

    app.use(vite.middlewares);
    
    // SPA Fallback for client-side routing like /admin
    app.use("*", async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      // Skip API requests if they fell through
      if (url.startsWith("/api/")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).send(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
    console.log("Vite dev middleware and SPA routing fallback loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Explicit production routing for /admin
    app.get("/admin", (req: Request, res: Response) => {
      return res.sendFile(path.join(distPath, "index.html"));
    });

    app.use(express.static(distPath));

    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fortschritt System] Backend server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
  process.exit(1);
});
