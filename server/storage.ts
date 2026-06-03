import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "./db";
import {
  type Sketch,
  type InsertSketch,
  sketches,
  type MeditationSession,
  type InsertMeditationSession,
  meditationSessions,
  type ActivitySession,
  type InsertActivitySession,
  activitySessions,
} from "../shared/schema";
import { users, type User, type UpsertUser } from "../shared/models/auth";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  addXp(userId: string, amount: number): Promise<User>;
  completeOnboarding(userId: string): Promise<User>;
  // Sketches
  createSketch(sketch: InsertSketch): Promise<Sketch>;
  getSketch(id: string): Promise<Sketch | undefined>;
  getSketches(): Promise<Sketch[]>;
  // Meditation
  createMeditationSession(userId: string, session: InsertMeditationSession): Promise<MeditationSession>;
  getRecentMeditationSessions(userId: string, sinceDays: number): Promise<MeditationSession[]>;
  // Activity
  createActivitySession(userId: string, session: InsertActivitySession): Promise<ActivitySession>;
  getActivityStats(userId: string): Promise<{
    totalSessions: number;
    totalTimeSeconds: number;
    thisWeekSessions: number;
    thisWeekTimeSeconds: number;
    byType: Record<string, number>;
    recentSessions: ActivitySession[];
  }>;
}

export class MemStorage implements IStorage {
  private userMap: Map<string, User> = new Map();
  private sketchMap: Map<string, Sketch> = new Map();
  private meditationList: MeditationSession[] = [];
  private activityList: ActivitySession[] = [];

  async getUser(id: string) { return this.userMap.get(id); }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.userMap.get(userData.id!);
    if (existing) {
      const updated = { ...existing, ...userData, updatedAt: new Date() };
      this.userMap.set(existing.id, updated);
      return updated;
    }
    const user: User = {
      xp: 0,
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      ...userData,
    };
    this.userMap.set(user.id, user);
    return user;
  }

  async addXp(userId: string, amount: number): Promise<User> {
    const user = this.userMap.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, xp: user.xp + amount, updatedAt: new Date() };
    this.userMap.set(userId, updated);
    return updated;
  }

  async completeOnboarding(userId: string): Promise<User> {
    const user = this.userMap.get(userId);
    if (!user) throw new Error("User not found");
    const updated = { ...user, onboardingCompleted: true, updatedAt: new Date() };
    this.userMap.set(userId, updated);
    return updated;
  }

  async createSketch(insertSketch: InsertSketch): Promise<Sketch> {
    const id = randomUUID();
    const sketch: Sketch = { ...insertSketch, id, createdAt: new Date() };
    this.sketchMap.set(id, sketch);
    return sketch;
  }

  async getSketch(id: string) { return this.sketchMap.get(id); }

  async getSketches(): Promise<Sketch[]> {
    return Array.from(this.sketchMap.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createMeditationSession(userId: string, session: InsertMeditationSession): Promise<MeditationSession> {
    const row: MeditationSession = {
      id: randomUUID(),
      userId,
      durationSeconds: session.durationSeconds,
      completedAt: new Date(),
    };
    this.meditationList.push(row);
    return row;
  }

  async getRecentMeditationSessions(userId: string, sinceDays: number): Promise<MeditationSession[]> {
    const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000;
    return this.meditationList
      .filter((s) => s.userId === userId && s.completedAt.getTime() >= cutoff)
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async createActivitySession(userId: string, session: InsertActivitySession): Promise<ActivitySession> {
    const row: ActivitySession = {
      id: randomUUID(),
      userId,
      activityType: session.activityType,
      durationSeconds: session.durationSeconds ?? 0,
      completedAt: new Date(),
    };
    this.activityList.push(row);
    return row;
  }

  async getActivityStats(userId: string) {
    const weekCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const userSessions = this.activityList.filter((s) => s.userId === userId);
    const thisWeek = userSessions.filter((s) => s.completedAt.getTime() >= weekCutoff);
    const byType: Record<string, number> = {};
    for (const s of userSessions) {
      byType[s.activityType] = (byType[s.activityType] ?? 0) + 1;
    }
    return {
      totalSessions: userSessions.length,
      totalTimeSeconds: userSessions.reduce((sum, s) => sum + s.durationSeconds, 0),
      thisWeekSessions: thisWeek.length,
      thisWeekTimeSeconds: thisWeek.reduce((sum, s) => sum + s.durationSeconds, 0),
      byType,
      recentSessions: [...userSessions]
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
        .slice(0, 5),
    };
  }
}

class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ xp: 0, onboardingCompleted: false, ...userData })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async addXp(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ xp: sql`${users.xp} + ${amount}`, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async completeOnboarding(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createSketch(insertSketch: InsertSketch): Promise<Sketch> {
    const [result] = await db.insert(sketches).values(insertSketch).returning();
    return result;
  }

  async getSketch(id: string): Promise<Sketch | undefined> {
    const [result] = await db.select().from(sketches).where(eq(sketches.id, id));
    return result;
  }

  async getSketches(): Promise<Sketch[]> {
    return db.select().from(sketches).orderBy(sketches.createdAt);
  }

  async createMeditationSession(userId: string, session: InsertMeditationSession): Promise<MeditationSession> {
    const [result] = await db
      .insert(meditationSessions)
      .values({ userId, durationSeconds: session.durationSeconds })
      .returning();
    return result;
  }

  async getRecentMeditationSessions(userId: string, sinceDays: number): Promise<MeditationSession[]> {
    const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
    return db
      .select()
      .from(meditationSessions)
      .where(and(eq(meditationSessions.userId, userId), gte(meditationSessions.completedAt, cutoff)))
      .orderBy(desc(meditationSessions.completedAt));
  }

  async createActivitySession(userId: string, session: InsertActivitySession): Promise<ActivitySession> {
    const [result] = await db
      .insert(activitySessions)
      .values({ userId, activityType: session.activityType, durationSeconds: session.durationSeconds ?? 0 })
      .returning();
    return result;
  }

  async getActivityStats(userId: string) {
    const weekCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const all = await db
      .select()
      .from(activitySessions)
      .where(eq(activitySessions.userId, userId))
      .orderBy(desc(activitySessions.completedAt));

    const thisWeek = all.filter((s) => s.completedAt >= weekCutoff);
    const byType: Record<string, number> = {};
    for (const s of all) {
      byType[s.activityType] = (byType[s.activityType] ?? 0) + 1;
    }
    return {
      totalSessions: all.length,
      totalTimeSeconds: all.reduce((sum, s) => sum + s.durationSeconds, 0),
      thisWeekSessions: thisWeek.length,
      thisWeekTimeSeconds: thisWeek.reduce((sum, s) => sum + s.durationSeconds, 0),
      byType,
      recentSessions: all.slice(0, 5),
    };
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
