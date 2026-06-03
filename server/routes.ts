import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSketchSchema, insertMeditationSessionSchema, insertActivitySessionSchema } from "../shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { isAuthenticated, createSupabaseAdmin } from "./auth";

const QUIZ_SYSTEM_PROMPT = `You are a fact-checker and quiz writer for a mobile app called Blink.
You will be given ONE specific topic. Create an engaging, FACTUALLY ACCURATE 10-question quiz about ONLY that topic.

ACCURACY IS THE #1 PRIORITY. Every question must have a verifiably correct answer. Every wrong option must be clearly wrong. If you are not 100% sure about a fact, do NOT use it — pick a different question you know is true. Do not invent statistics, dates, names, or relationships.

Respond with ONLY valid JSON — no markdown, no code fences, no extra text.

The JSON must match this exact structure:
{
  "title": "<Short catchy title, 2-4 words, about the given topic>",
  "emoji": "<One relevant emoji>",
  "description": "<One fun sentence about what this quiz covers>",
  "questions": [
    {
      "id": 1,
      "text": "<UPPERCASE QUESTION TEXT>",
      "type": "multiple",
      "options": [
        { "letter": "A", "text": "<option>" },
        { "letter": "B", "text": "<option>" },
        { "letter": "C", "text": "<option>" },
        { "letter": "D", "text": "<option>" }
      ],
      "correctAnswer": "<A, B, C, or D>",
      "funFact": "<One sentence explaining WHY this answer is correct>",
      "funFactEmoji": "<One relevant emoji>"
    }
  ]
}

For true/false questions, use type "truefalse" and only two options: A (True) and B (False).
Make exactly 10 questions. Mix multiple choice and true/false.`;

function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function buildMeditationSummary(userId: string) {
  const sessions = await storage.getRecentMeditationSessions(userId, 30);
  const dayKeys = new Set(sessions.map((s) => toDayKey(s.completedAt)));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);
  if (!dayKeys.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dayKeys.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const last7: { date: string; completed: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDayKey(d);
    last7.push({ date: key, completed: dayKeys.has(key) });
  }

  return {
    streak,
    completedToday: dayKeys.has(toDayKey(today)),
    last7,
    totalSessions: sessions.length,
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // ── Auth ──────────────────────────────────────────────────────────────────

  app.get("/api/auth/user", async (req: any, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "Unauthorized" });

      const supabase = createSupabaseAdmin();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ message: "Unauthorized" });

      const dbUser = await storage.upsertUser({
        id: user.id,
        email: user.email ?? null,
        firstName: (user.user_metadata?.full_name as string)?.split(" ")[0] ?? null,
        lastName: (user.user_metadata?.full_name as string)?.split(" ").slice(1).join(" ") ?? null,
        profileImageUrl: (user.user_metadata?.avatar_url as string) ?? null,
      });

      res.json(dbUser);
    } catch (error) {
      console.error("Auth user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/complete-onboarding", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.completeOnboarding(userId);
      res.json(user);
    } catch (error) {
      console.error("Complete onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // ── Sketches ──────────────────────────────────────────────────────────────

  app.post("/api/sketches", async (req, res) => {
    try {
      const body = insertSketchSchema.parse(req.body);
      const sketch = await storage.createSketch(body);
      res.json(sketch);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sketch data", errors: error.errors });
      }
      throw error;
    }
  });

  app.get("/api/sketches/:id", async (req, res) => {
    const sketch = await storage.getSketch(req.params.id);
    if (!sketch) return res.status(404).json({ message: "Sketch not found" });
    res.json(sketch);
  });

  app.get("/api/sketches", async (_req, res) => {
    const sketches = await storage.getSketches();
    res.json(sketches);
  });

  // ── Quiz ──────────────────────────────────────────────────────────────────

  app.post("/api/quiz/generate", async (req, res) => {
    try {
      const { subjects } = z.object({ subjects: z.array(z.string()).min(1) }).parse(req.body);
      const topic = subjects[0];

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ message: "OpenAI API key not configured" });

      const openai = new OpenAI({ apiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: QUIZ_SYSTEM_PROMPT },
          { role: "user", content: `Create a quiz about: ${topic}` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) return res.status(500).json({ message: "No response from OpenAI" });

      let quizData;
      try {
        quizData = JSON.parse(raw);
      } catch {
        return res.status(500).json({ message: "Failed to parse quiz JSON", raw });
      }

      if (quizData.quiz && typeof quizData.quiz === "object" && !quizData.questions) {
        quizData = quizData.quiz;
      }

      if (quizData.questions) {
        quizData.questions = quizData.questions.map((q: any) => ({
          funFact: "Interesting fact!",
          funFactEmoji: "💡",
          keywords: [],
          ...q,
          correct: q.correct ?? q.correctAnswer ?? "",
        }));
      }

      const quiz = {
        id: "generated",
        badge: "5 MIN QUIZZ",
        keywords: [],
        ...quizData,
      };

      res.json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Quiz generation error:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });

  // ── Sketch analysis ───────────────────────────────────────────────────────

  app.post("/api/sketch/analyze", async (req, res) => {
    try {
      const { dataUrl, prompt } = z
        .object({ dataUrl: z.string().min(10), prompt: z.string().min(1) })
        .parse(req.body);

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ message: "OpenAI API key not configured" });

      const openai = new OpenAI({ apiKey });
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a friendly drawing judge in a kids' sketch game. The player was given ONE word and drew it as a simple doodle/sketch. These are not artistic masterpieces — they are quick hand-drawn sketches.

Your ONLY job: decide how recognisable the drawing is for the given word.

Ask yourself: "If I covered up the word and showed this drawing to someone, how likely are they to guess the right word?"

Scoring guide:
0–20  : Blank, or just random marks with no connection to the word at all.
21–40 : Only the most vague hint — one simple shape, barely related. Most people would NOT guess the word.
41–60 : Partial match — some features are present, but the drawing is ambiguous or incomplete.
61–75 : Clear attempt — most people would recognise the general concept even if details are rough.
76–90 : Good match — the key identifying features of the word are visible and recognisable.
91–100: Excellent — immediately obvious, captures the word distinctively.

Important rules:
- Judge ONLY recognisability, not drawing quality or artistic skill.
- A rough but clearly recognisable sketch of an elephant (body, trunk, ears, legs) deserves 70+.
- A single oval or circle for any complex word deserves 20–30 at most, regardless of color.
- Do NOT penalise imperfect lines, shakiness, or simple style.

Respond with ONLY a JSON object: { "score": <integer 0-100> }`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The word to draw was: "${prompt}". How accurately does this drawing represent it?`,
              },
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${base64}`, detail: "high" },
              },
            ],
          },
        ],
        max_tokens: 60,
        temperature: 0.2,
      });

      const raw = completion.choices[0]?.message?.content?.trim() ?? "";
      let score = 0;
      try {
        const parsed = JSON.parse(raw);
        score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
      } catch {
        const match = raw.match(/\d+/);
        score = match ? Math.max(0, Math.min(100, parseInt(match[0]))) : 0;
      }

      res.json({ score });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Sketch analysis error:", error);
      res.status(500).json({ message: "Failed to analyse sketch" });
    }
  });

  // ── Meditation ────────────────────────────────────────────────────────────

  app.post("/api/meditation/complete", isAuthenticated, async (req: any, res) => {
    try {
      const body = insertMeditationSessionSchema.parse(req.body);
      const userId = req.user.id;
      const session = await storage.createMeditationSession(userId, body);
      const summary = await buildMeditationSummary(userId);
      res.json({ session, ...summary });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      console.error("Meditation complete error:", error);
      res.status(500).json({ message: "Failed to record meditation session" });
    }
  });

  app.get("/api/meditation/recent", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const summary = await buildMeditationSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error("Meditation recent error:", error);
      res.status(500).json({ message: "Failed to load meditation history" });
    }
  });

  // ── Rebus ─────────────────────────────────────────────────────────────────

  app.post("/api/rebus/generate", async (req, res) => {
    try {
      const { topic } = z.object({ topic: z.string().min(1).max(100) }).parse(req.body);

      const FALLBACK = [
        { emojis: "⚡ 🌩️ ☁️ 🔌 💡", answer: "Electricity", explanation: "Lightning + storm + cloud + plug + light bulb = electrical power!" },
        { emojis: "📖 ✏️ 🧪 🎓 🏫", answer: "Education", explanation: "Book + pencil + experiment + graduation + school = the journey of learning!" },
        { emojis: "🌱 🌧️ ☀️ 🕐 🌳", answer: "Growth", explanation: "Seedling + rain + sun + time + tree = the process of growing!" },
        { emojis: "🔬 🐛 🧬 🏥 💊", answer: "Biology", explanation: "Microscope + organism + DNA + health + medicine = the science of life!" },
        { emojis: "🌙 ✨ 🔭 🚀 🌌", answer: "Space", explanation: "Moon + stars + telescope + rocket + galaxy = the vast universe!" },
        { emojis: "🎸 🎤 🥁 🎵 🎶", answer: "Music", explanation: "Guitar + microphone + drums + notes + melody = the world of music!" },
      ];

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.json({ topic, puzzles: FALLBACK });

      const openai = new OpenAI({ apiKey });

      const REBUS_PROMPT = `You are a creative emoji puzzle designer for a mobile learning app called Blink.
Create 6 emoji rebus puzzles about the topic: "${topic}".

HOW THE GAME WORKS:
- Emojis are revealed ONE AT A TIME (emoji 1 first, then 2, then 3…)
- The player types a free-text guess after each reveal
- More emojis = more hints until the player gets it

REQUIREMENTS for each puzzle:
1. Exactly 5 emojis — ordered from MOST ABSTRACT to MOST OBVIOUS
2. EVERY emoji must have a clear, logical connection to the answer.
3. The answer is 1–2 words related to "${topic}"
4. Write a fun 1-sentence explanation linking the emoji chain to the answer

Respond with ONLY valid JSON — no markdown, no code fences.
Separate each emoji with a single space.

{
  "topic": "${topic}",
  "puzzles": [
    {
      "emojis": "🌞 🌿 💧 🔄 🍃",
      "answer": "Photosynthesis",
      "explanation": "Sun + plant + water + cycle + leaf = plants converting sunlight into energy!"
    }
  ]
}

Make exactly 6 puzzles. Vary difficulty. Return ONLY the JSON.`;

      const isValidPuzzle = (p: any) => {
        if (!p) return false;
        if (typeof p.emojis !== "string" || !p.emojis.trim()) return false;
        if (typeof p.answer !== "string" || !p.answer.trim()) return false;
        if (typeof p.explanation !== "string" || !p.explanation.trim()) return false;
        const parts = p.emojis.trim().split(/\s+/).filter((s: string) => s.length > 0);
        return parts.length >= 5;
      };

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: REBUS_PROMPT }],
          temperature: 0.8,
          max_tokens: 1500,
        });

        const raw = completion.choices[0]?.message?.content?.trim() ?? "";
        const data = JSON.parse(raw);
        const valid = Array.isArray(data.puzzles) ? data.puzzles.filter(isValidPuzzle) : [];
        if (valid.length < 6) return res.json({ topic, puzzles: FALLBACK });
        return res.json({ topic, puzzles: valid.slice(0, 6) });
      } catch {
        return res.json({ topic, puzzles: FALLBACK });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Rebus generation error:", error);
      res.status(500).json({ message: "Failed to generate rebus puzzles" });
    }
  });

  // ── Activity / XP ─────────────────────────────────────────────────────────

  app.post("/api/activity/complete", isAuthenticated, async (req: any, res) => {
    try {
      const body = insertActivitySessionSchema.parse(req.body);
      const userId = req.user.id;
      const session = await storage.createActivitySession(userId, body);
      res.json({ session });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      console.error("Activity complete error:", error);
      res.status(500).json({ message: "Failed to record activity session" });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getActivityStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to load stats" });
    }
  });

  app.post("/api/xp/award", isAuthenticated, async (req: any, res) => {
    try {
      const { amount } = z.object({ amount: z.number().int().min(1).max(1000) }).parse(req.body);
      const userId = req.user.id;
      const user = await storage.addXp(userId, amount);
      res.json({ xp: user.xp });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("XP award error:", error);
      res.status(500).json({ message: "Failed to award XP" });
    }
  });

  return httpServer;
}
