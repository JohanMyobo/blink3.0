"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/_source.ts
var source_exports = {};
__export(source_exports, {
  default: () => handler
});
module.exports = __toCommonJS(source_exports);

// server/app.ts
var import_express2 = __toESM(require("express"));

// server/storage.ts
var import_drizzle_orm2 = require("drizzle-orm");

// server/db.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = require("pg");
var pool = new import_pg.Pool({ connectionString: process.env.DATABASE_URL });
var db = (0, import_node_postgres.drizzle)(pool);

// shared/schema.ts
var import_drizzle_orm = require("drizzle-orm");
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var sketches = (0, import_pg_core.pgTable)("sketches", {
  id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
  dataUrl: (0, import_pg_core.text)("data_url").notNull(),
  prompt: (0, import_pg_core.text)("prompt").notNull(),
  strokeCount: (0, import_pg_core.integer)("stroke_count").notNull(),
  timeElapsed: (0, import_pg_core.integer)("time_elapsed").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").notNull().default(import_drizzle_orm.sql`now()`)
});
var insertSketchSchema = (0, import_drizzle_zod.createInsertSchema)(sketches).omit({
  id: true,
  createdAt: true
});
var meditationSessions = (0, import_pg_core.pgTable)(
  "meditation_sessions",
  {
    id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
    userId: (0, import_pg_core.varchar)("user_id").notNull(),
    durationSeconds: (0, import_pg_core.integer)("duration_seconds").notNull(),
    completedAt: (0, import_pg_core.timestamp)("completed_at").notNull().default(import_drizzle_orm.sql`now()`)
  },
  (table) => [(0, import_pg_core.index)("IDX_meditation_user_completed").on(table.userId, table.completedAt)]
);
var insertMeditationSessionSchema = (0, import_drizzle_zod.createInsertSchema)(meditationSessions).omit({
  id: true,
  userId: true,
  completedAt: true
});
var activitySessions = (0, import_pg_core.pgTable)(
  "activity_sessions",
  {
    id: (0, import_pg_core.varchar)("id").primaryKey().default(import_drizzle_orm.sql`gen_random_uuid()`),
    userId: (0, import_pg_core.varchar)("user_id").notNull(),
    activityType: (0, import_pg_core.varchar)("activity_type").notNull(),
    // "meditation" | "quiz" | "sketch"
    durationSeconds: (0, import_pg_core.integer)("duration_seconds").notNull().default(0),
    completedAt: (0, import_pg_core.timestamp)("completed_at").notNull().default(import_drizzle_orm.sql`now()`)
  },
  (table) => [(0, import_pg_core.index)("IDX_activity_user_completed").on(table.userId, table.completedAt)]
);
var insertActivitySessionSchema = (0, import_drizzle_zod.createInsertSchema)(activitySessions).omit({
  id: true,
  userId: true,
  completedAt: true
});

// shared/models/auth.ts
var import_pg_core2 = require("drizzle-orm/pg-core");
var users = (0, import_pg_core2.pgTable)("users", {
  id: (0, import_pg_core2.varchar)("id").primaryKey(),
  email: (0, import_pg_core2.varchar)("email").unique(),
  firstName: (0, import_pg_core2.varchar)("first_name"),
  lastName: (0, import_pg_core2.varchar)("last_name"),
  profileImageUrl: (0, import_pg_core2.varchar)("profile_image_url"),
  xp: (0, import_pg_core2.integer)("xp").default(0).notNull(),
  onboardingCompleted: (0, import_pg_core2.boolean)("onboarding_completed").default(false).notNull(),
  createdAt: (0, import_pg_core2.timestamp)("created_at").defaultNow(),
  updatedAt: (0, import_pg_core2.timestamp)("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date())
});

// server/storage.ts
var import_crypto = require("crypto");
var MemStorage = class {
  userMap = /* @__PURE__ */ new Map();
  sketchMap = /* @__PURE__ */ new Map();
  meditationList = [];
  activityList = [];
  async getUser(id) {
    return this.userMap.get(id);
  }
  async upsertUser(userData) {
    const existing = this.userMap.get(userData.id);
    if (existing) {
      const updated = { ...existing, ...userData, updatedAt: /* @__PURE__ */ new Date() };
      this.userMap.set(existing.id, updated);
      return updated;
    }
    const user = {
      xp: 0,
      onboardingCompleted: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      ...userData
    };
    this.userMap.set(user.id, user);
    return user;
  }
  async addXp(userId, amount) {
    const user = this.userMap.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, xp: user.xp + amount, updatedAt: /* @__PURE__ */ new Date() };
    this.userMap.set(userId, updated);
    return updated;
  }
  async completeOnboarding(userId) {
    const user = this.userMap.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, onboardingCompleted: true, updatedAt: /* @__PURE__ */ new Date() };
    this.userMap.set(userId, updated);
    return updated;
  }
  async createSketch(insertSketch) {
    const id = (0, import_crypto.randomUUID)();
    const sketch = { ...insertSketch, id, createdAt: /* @__PURE__ */ new Date() };
    this.sketchMap.set(id, sketch);
    return sketch;
  }
  async getSketch(id) {
    return this.sketchMap.get(id);
  }
  async getSketches() {
    return Array.from(this.sketchMap.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  async createMeditationSession(userId, session) {
    const row = {
      id: (0, import_crypto.randomUUID)(),
      userId,
      durationSeconds: session.durationSeconds,
      completedAt: /* @__PURE__ */ new Date()
    };
    this.meditationList.push(row);
    return row;
  }
  async getRecentMeditationSessions(userId, sinceDays) {
    const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1e3;
    return this.meditationList.filter((s) => s.userId === userId && s.completedAt.getTime() >= cutoff).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }
  async createActivitySession(userId, session) {
    const row = {
      id: (0, import_crypto.randomUUID)(),
      userId,
      activityType: session.activityType,
      durationSeconds: session.durationSeconds ?? 0,
      completedAt: /* @__PURE__ */ new Date()
    };
    this.activityList.push(row);
    return row;
  }
  async getActivityStats(userId) {
    const weekCutoff = Date.now() - 7 * 24 * 60 * 60 * 1e3;
    const userSessions = this.activityList.filter((s) => s.userId === userId);
    const thisWeek = userSessions.filter((s) => s.completedAt.getTime() >= weekCutoff);
    const byType = {};
    for (const s of userSessions) {
      byType[s.activityType] = (byType[s.activityType] ?? 0) + 1;
    }
    return {
      totalSessions: userSessions.length,
      totalTimeSeconds: userSessions.reduce((sum, s) => sum + s.durationSeconds, 0),
      thisWeekSessions: thisWeek.length,
      thisWeekTimeSeconds: thisWeek.reduce((sum, s) => sum + s.durationSeconds, 0),
      byType,
      recentSessions: [...userSessions].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, 5)
    };
  }
};
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values({ xp: 0, onboardingCompleted: false, ...userData }).onConflictDoUpdate({
      target: users.id,
      set: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async addXp(userId, amount) {
    const [user] = await db.update(users).set({ xp: import_drizzle_orm2.sql`${users.xp} + ${amount}`, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(users.id, userId)).returning();
    return user;
  }
  async completeOnboarding(userId) {
    const [user] = await db.update(users).set({ onboardingCompleted: true, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(users.id, userId)).returning();
    return user;
  }
  async createSketch(insertSketch) {
    const [result] = await db.insert(sketches).values(insertSketch).returning();
    return result;
  }
  async getSketch(id) {
    const [result] = await db.select().from(sketches).where((0, import_drizzle_orm2.eq)(sketches.id, id));
    return result;
  }
  async getSketches() {
    return db.select().from(sketches).orderBy(sketches.createdAt);
  }
  async createMeditationSession(userId, session) {
    const [result] = await db.insert(meditationSessions).values({ userId, durationSeconds: session.durationSeconds }).returning();
    return result;
  }
  async getRecentMeditationSessions(userId, sinceDays) {
    const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1e3);
    return db.select().from(meditationSessions).where((0, import_drizzle_orm2.and)((0, import_drizzle_orm2.eq)(meditationSessions.userId, userId), (0, import_drizzle_orm2.gte)(meditationSessions.completedAt, cutoff))).orderBy((0, import_drizzle_orm2.desc)(meditationSessions.completedAt));
  }
  async createActivitySession(userId, session) {
    const [result] = await db.insert(activitySessions).values({ userId, activityType: session.activityType, durationSeconds: session.durationSeconds ?? 0 }).returning();
    return result;
  }
  async getActivityStats(userId) {
    const weekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
    const all = await db.select().from(activitySessions).where((0, import_drizzle_orm2.eq)(activitySessions.userId, userId)).orderBy((0, import_drizzle_orm2.desc)(activitySessions.completedAt));
    const thisWeek = all.filter((s) => s.completedAt >= weekCutoff);
    const byType = {};
    for (const s of all) {
      byType[s.activityType] = (byType[s.activityType] ?? 0) + 1;
    }
    return {
      totalSessions: all.length,
      totalTimeSeconds: all.reduce((sum, s) => sum + s.durationSeconds, 0),
      thisWeekSessions: thisWeek.length,
      thisWeekTimeSeconds: thisWeek.reduce((sum, s) => sum + s.durationSeconds, 0),
      byType,
      recentSessions: all.slice(0, 5)
    };
  }
};
var storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();

// server/routes.ts
var import_zod = require("zod");
var import_openai = __toESM(require("openai"));

// server/auth.ts
var import_supabase_js = require("@supabase/supabase-js");
function createSupabaseAdmin() {
  return (0, import_supabase_js.createClient)(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
var isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const supabase = createSupabaseAdmin();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ message: "Unauthorized" });
  req.user = user;
  next();
};

// server/routes.ts
var QUIZ_SYSTEM_PROMPT = `You are a fact-checker and quiz writer for a mobile app called Blink.
You will be given ONE specific topic. Create an engaging, FACTUALLY ACCURATE 10-question quiz about ONLY that topic.

ACCURACY IS THE #1 PRIORITY. Every question must have a verifiably correct answer. Every wrong option must be clearly wrong. If you are not 100% sure about a fact, do NOT use it \u2014 pick a different question you know is true. Do not invent statistics, dates, names, or relationships.

Respond with ONLY valid JSON \u2014 no markdown, no code fences, no extra text.

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
function toDayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
async function buildMeditationSummary(userId) {
  const sessions = await storage.getRecentMeditationSessions(userId, 30);
  const dayKeys = new Set(sessions.map((s) => toDayKey(s.completedAt)));
  let streak = 0;
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);
  if (!dayKeys.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dayKeys.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  const last7 = [];
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
    totalSessions: sessions.length
  };
}
async function registerRoutes(httpServer, app) {
  app.get("/api/auth/user", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "Unauthorized" });
      const supabase = createSupabaseAdmin();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return res.status(401).json({ message: "Unauthorized" });
      const dbUser = await storage.upsertUser({
        id: user.id,
        email: user.email ?? null,
        firstName: user.user_metadata?.full_name?.split(" ")[0] ?? null,
        lastName: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ?? null,
        profileImageUrl: user.user_metadata?.avatar_url ?? null
      });
      res.json(dbUser);
    } catch (error) {
      console.error("Auth user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app.post("/api/auth/complete-onboarding", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.completeOnboarding(userId);
      res.json(user);
    } catch (error) {
      console.error("Complete onboarding error:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });
  app.post("/api/sketches", async (req, res) => {
    try {
      const body = insertSketchSchema.parse(req.body);
      const sketch = await storage.createSketch(body);
      res.json(sketch);
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
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
    const sketches2 = await storage.getSketches();
    res.json(sketches2);
  });
  app.post("/api/quiz/generate", async (req, res) => {
    try {
      const { subjects } = import_zod.z.object({ subjects: import_zod.z.array(import_zod.z.string()).min(1) }).parse(req.body);
      const topic = subjects[0];
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ message: "OpenAI API key not configured" });
      const openai = new import_openai.default({ apiKey });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: QUIZ_SYSTEM_PROMPT },
          { role: "user", content: `Create a quiz about: ${topic}` }
        ],
        temperature: 0.7,
        max_tokens: 4e3
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
        quizData.questions = quizData.questions.map((q) => ({
          funFact: "Interesting fact!",
          funFactEmoji: "\u{1F4A1}",
          keywords: [],
          ...q,
          correct: q.correct ?? q.correctAnswer ?? ""
        }));
      }
      const quiz = {
        id: "generated",
        badge: "5 MIN QUIZZ",
        keywords: [],
        ...quizData
      };
      res.json(quiz);
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Quiz generation error:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });
  app.post("/api/sketch/analyze", async (req, res) => {
    try {
      const { dataUrl, prompt } = import_zod.z.object({ dataUrl: import_zod.z.string().min(10), prompt: import_zod.z.string().min(1) }).parse(req.body);
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ message: "OpenAI API key not configured" });
      const openai = new import_openai.default({ apiKey });
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a friendly drawing judge in a kids' sketch game. The player was given ONE word and drew it as a simple doodle/sketch. These are not artistic masterpieces \u2014 they are quick hand-drawn sketches.

Your ONLY job: decide how recognisable the drawing is for the given word.

Ask yourself: "If I covered up the word and showed this drawing to someone, how likely are they to guess the right word?"

Scoring guide:
0\u201320  : Blank, or just random marks with no connection to the word at all.
21\u201340 : Only the most vague hint \u2014 one simple shape, barely related. Most people would NOT guess the word.
41\u201360 : Partial match \u2014 some features are present, but the drawing is ambiguous or incomplete.
61\u201375 : Clear attempt \u2014 most people would recognise the general concept even if details are rough.
76\u201390 : Good match \u2014 the key identifying features of the word are visible and recognisable.
91\u2013100: Excellent \u2014 immediately obvious, captures the word distinctively.

Important rules:
- Judge ONLY recognisability, not drawing quality or artistic skill.
- A rough but clearly recognisable sketch of an elephant (body, trunk, ears, legs) deserves 70+.
- A single oval or circle for any complex word deserves 20\u201330 at most, regardless of color.
- Do NOT penalise imperfect lines, shakiness, or simple style.

Respond with ONLY a JSON object: { "score": <integer 0-100> }`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `The word to draw was: "${prompt}". How accurately does this drawing represent it?`
              },
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${base64}`, detail: "high" }
              }
            ]
          }
        ],
        max_tokens: 60,
        temperature: 0.2
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
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Sketch analysis error:", error);
      res.status(500).json({ message: "Failed to analyse sketch" });
    }
  });
  app.post("/api/meditation/complete", isAuthenticated, async (req, res) => {
    try {
      const body = insertMeditationSessionSchema.parse(req.body);
      const userId = req.user.id;
      const session = await storage.createMeditationSession(userId, body);
      const summary = await buildMeditationSummary(userId);
      res.json({ session, ...summary });
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      console.error("Meditation complete error:", error);
      res.status(500).json({ message: "Failed to record meditation session" });
    }
  });
  app.get("/api/meditation/recent", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const summary = await buildMeditationSummary(userId);
      res.json(summary);
    } catch (error) {
      console.error("Meditation recent error:", error);
      res.status(500).json({ message: "Failed to load meditation history" });
    }
  });
  app.post("/api/rebus/generate", async (req, res) => {
    try {
      const { topic } = import_zod.z.object({ topic: import_zod.z.string().min(1).max(100) }).parse(req.body);
      const FALLBACK = [
        { emojis: "\u26A1 \u{1F329}\uFE0F \u2601\uFE0F \u{1F50C} \u{1F4A1}", answer: "Electricity", explanation: "Lightning + storm + cloud + plug + light bulb = electrical power!" },
        { emojis: "\u{1F4D6} \u270F\uFE0F \u{1F9EA} \u{1F393} \u{1F3EB}", answer: "Education", explanation: "Book + pencil + experiment + graduation + school = the journey of learning!" },
        { emojis: "\u{1F331} \u{1F327}\uFE0F \u2600\uFE0F \u{1F550} \u{1F333}", answer: "Growth", explanation: "Seedling + rain + sun + time + tree = the process of growing!" },
        { emojis: "\u{1F52C} \u{1F41B} \u{1F9EC} \u{1F3E5} \u{1F48A}", answer: "Biology", explanation: "Microscope + organism + DNA + health + medicine = the science of life!" },
        { emojis: "\u{1F319} \u2728 \u{1F52D} \u{1F680} \u{1F30C}", answer: "Space", explanation: "Moon + stars + telescope + rocket + galaxy = the vast universe!" },
        { emojis: "\u{1F3B8} \u{1F3A4} \u{1F941} \u{1F3B5} \u{1F3B6}", answer: "Music", explanation: "Guitar + microphone + drums + notes + melody = the world of music!" }
      ];
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.json({ topic, puzzles: FALLBACK });
      const openai = new import_openai.default({ apiKey });
      const REBUS_PROMPT = `You are a creative emoji puzzle designer for a mobile learning app called Blink.
Create 6 emoji rebus puzzles about the topic: "${topic}".

HOW THE GAME WORKS:
- Emojis are revealed ONE AT A TIME (emoji 1 first, then 2, then 3\u2026)
- The player types a free-text guess after each reveal
- More emojis = more hints until the player gets it

REQUIREMENTS for each puzzle:
1. Exactly 5 emojis \u2014 ordered from MOST ABSTRACT to MOST OBVIOUS
2. EVERY emoji must have a clear, logical connection to the answer.
3. The answer is 1\u20132 words related to "${topic}"
4. Write a fun 1-sentence explanation linking the emoji chain to the answer

Respond with ONLY valid JSON \u2014 no markdown, no code fences.
Separate each emoji with a single space.

{
  "topic": "${topic}",
  "puzzles": [
    {
      "emojis": "\u{1F31E} \u{1F33F} \u{1F4A7} \u{1F504} \u{1F343}",
      "answer": "Photosynthesis",
      "explanation": "Sun + plant + water + cycle + leaf = plants converting sunlight into energy!"
    }
  ]
}

Make exactly 6 puzzles. Vary difficulty. Return ONLY the JSON.`;
      const isValidPuzzle = (p) => {
        if (!p) return false;
        if (typeof p.emojis !== "string" || !p.emojis.trim()) return false;
        if (typeof p.answer !== "string" || !p.answer.trim()) return false;
        if (typeof p.explanation !== "string" || !p.explanation.trim()) return false;
        const parts = p.emojis.trim().split(/\s+/).filter((s) => s.length > 0);
        return parts.length >= 5;
      };
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: REBUS_PROMPT }],
          temperature: 0.8,
          max_tokens: 1500
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
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Rebus generation error:", error);
      res.status(500).json({ message: "Failed to generate rebus puzzles" });
    }
  });
  app.post("/api/activity/complete", isAuthenticated, async (req, res) => {
    try {
      const body = insertActivitySessionSchema.parse(req.body);
      const userId = req.user.id;
      const session = await storage.createActivitySession(userId, body);
      res.json({ session });
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      console.error("Activity complete error:", error);
      res.status(500).json({ message: "Failed to record activity session" });
    }
  });
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getActivityStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to load stats" });
    }
  });
  app.post("/api/xp/award", isAuthenticated, async (req, res) => {
    try {
      const { amount } = import_zod.z.object({ amount: import_zod.z.number().int().min(1).max(1e3) }).parse(req.body);
      const userId = req.user.id;
      const user = await storage.addXp(userId, amount);
      res.json({ xp: user.xp });
    } catch (error) {
      if (error instanceof import_zod.z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("XP award error:", error);
      res.status(500).json({ message: "Failed to award XP" });
    }
  });
  return httpServer;
}

// server/app.ts
var import_http = require("http");

// server/static.ts
var import_express = __toESM(require("express"));
var import_fs = __toESM(require("fs"));
var import_path = __toESM(require("path"));
function serveStatic(app) {
  const distPath = import_path.default.resolve(__dirname, "public");
  if (!import_fs.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(import_express.default.static(distPath));
  app.use("/{*path}", (_req, res) => {
    res.sendFile(import_path.default.resolve(distPath, "index.html"));
  });
}

// server/app.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function createApp() {
  const app = (0, import_express2.default)();
  const httpServer = (0, import_http.createServer)(app);
  app.use(
    import_express2.default.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app.use(import_express2.default.urlencoded({ extended: false }));
  app.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path2.startsWith("/api")) {
        let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        log(logLine);
      }
    });
    next();
  });
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) return next(err);
    return res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
  }
  return { app, httpServer };
}

// api/_source.ts
var initPromise = createApp();
async function handler(req, res) {
  const { app } = await initPromise;
  app(req, res);
}
