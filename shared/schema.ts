import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sketches = pgTable("sketches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataUrl: text("data_url").notNull(),
  prompt: text("prompt").notNull(),
  strokeCount: integer("stroke_count").notNull(),
  timeElapsed: integer("time_elapsed").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertSketchSchema = createInsertSchema(sketches).omit({
  id: true,
  createdAt: true,
});

export type InsertSketch = z.infer<typeof insertSketchSchema>;
export type Sketch = typeof sketches.$inferSelect;

export const meditationSessions = pgTable(
  "meditation_sessions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    completedAt: timestamp("completed_at").notNull().default(sql`now()`),
  },
  (table) => [index("IDX_meditation_user_completed").on(table.userId, table.completedAt)],
);

export const insertMeditationSessionSchema = createInsertSchema(meditationSessions).omit({
  id: true,
  userId: true,
  completedAt: true,
});

export type InsertMeditationSession = z.infer<typeof insertMeditationSessionSchema>;
export type MeditationSession = typeof meditationSessions.$inferSelect;

export const activitySessions = pgTable(
  "activity_sessions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull(),
    activityType: varchar("activity_type").notNull(), // "meditation" | "quiz" | "sketch"
    durationSeconds: integer("duration_seconds").notNull().default(0),
    completedAt: timestamp("completed_at").notNull().default(sql`now()`),
  },
  (table) => [index("IDX_activity_user_completed").on(table.userId, table.completedAt)],
);

export const insertActivitySessionSchema = createInsertSchema(activitySessions).omit({
  id: true,
  userId: true,
  completedAt: true,
});

export type InsertActivitySession = z.infer<typeof insertActivitySessionSchema>;
export type ActivitySession = typeof activitySessions.$inferSelect;
