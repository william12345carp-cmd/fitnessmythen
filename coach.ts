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

    let reply = "";

if (question.includes("Kohlenhydrate")) {
  reply = "Nein. Kohlenhydrate am Abend machen nicht automatisch dick. Entscheidend ist die gesamte Kalorienbilanz über den Tag.";
} else if (question.includes("Protein")) {
  reply = "Für Muskelaufbau empfehlen Studien etwa 1,6 bis 2,2 Gramm Protein pro Kilogramm Körpergewicht.";
} else if (question.includes("Muskelkater")) {
  reply = "Nein. Muskelkater ist kein zuverlässiger Indikator für Muskelaufbau oder Trainingsfortschritt.";
} else if (question.includes("Intervallfasten")) {
  reply = "Intervallfasten ist nicht magisch. Entscheidend bleibt die Kalorienbilanz.";
} else {
  reply = "Der Fortschritt KI Coach wird aktuell aktualisiert. Bitte nutze vorerst die Beispiel-Fragen.";
}
   
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("AI Coach Serverless Error:", error);
    return res.status(500).json({
      error: "Fehler bei der Kontaktaufnahme mit dem KI Coach. Bitte überprüfe dein Setup.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
