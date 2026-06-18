import { GoogleGenAI } from "@google/genai";

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
          "User-Agent": "aistudio-build-vercel",
        },
      },
    });
  }
  return aiClient;
}

export default async function handler(req: any, res: any) {
  // CORS Headers support (optional but useful for Vercel deployment)
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

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
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("AI Coach Serverless Error:", error);
    return res.status(500).json({
      error: "Fehler bei der Kontaktaufnahme mit dem KI Coach. Bitte überprüfe dein Setup.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
