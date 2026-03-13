import { eq, and, lt, desc, or, isNull } from "drizzle-orm";
import { db } from "./db";
import {
  users, verificationCodes, workstreams, labels, tasks, aiSuggestions,
  type User, type InsertUser,
  type VerificationCode, type InsertVerificationCode,
  type Workstream, type InsertWorkstream,
  type Label, type InsertLabel,
  type Task, type InsertTask,
  type AiSuggestion, type InsertAiSuggestion,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createVerificationCode(data: InsertVerificationCode): Promise<VerificationCode>;
  getValidCode(email: string, code: string): Promise<VerificationCode | undefined>;
  markCodeUsed(id: string): Promise<void>;
  cleanExpiredCodes(): Promise<void>;

  getWorkstreams(userId: string): Promise<Workstream[]>;
  createWorkstream(data: InsertWorkstream): Promise<Workstream>;
  updateWorkstream(id: string, userId: string, updates: Partial<Omit<InsertWorkstream, "userId">>): Promise<Workstream | undefined>;
  deleteWorkstream(id: string, userId: string): Promise<boolean>;

  getLabels(userId: string): Promise<Label[]>;
  createLabel(data: InsertLabel): Promise<Label>;
  updateLabel(id: string, userId: string, updates: Partial<Omit<InsertLabel, "userId">>): Promise<Label | undefined>;
  deleteLabel(id: string, userId: string): Promise<boolean>;

  getTasks(userId: string, weekOf?: string): Promise<Task[]>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, userId: string, updates: Partial<Omit<InsertTask, "userId">>): Promise<Task | undefined>;
  deleteTask(id: string, userId: string): Promise<boolean>;

  getAiSuggestions(userId: string, status?: string): Promise<AiSuggestion[]>;
  createAiSuggestion(data: InsertAiSuggestion): Promise<AiSuggestion>;
  updateAiSuggestionStatus(id: string, userId: string, status: string): Promise<AiSuggestion | undefined>;
  deleteAiSuggestion(id: string, userId: string): Promise<boolean>;
  clearAiSuggestions(userId: string, status?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({ ...data, email: data.email.toLowerCase() }).returning();
    return user;
  }

  async createVerificationCode(data: InsertVerificationCode): Promise<VerificationCode> {
    const [code] = await db.insert(verificationCodes).values(data).returning();
    return code;
  }

  async getValidCode(email: string, code: string): Promise<VerificationCode | undefined> {
    const [result] = await db.select().from(verificationCodes).where(
      and(
        eq(verificationCodes.email, email.toLowerCase()),
        eq(verificationCodes.code, code),
        eq(verificationCodes.used, false),
      )
    );
    if (result && new Date(result.expiresAt) > new Date()) {
      return result;
    }
    return undefined;
  }

  async markCodeUsed(id: string): Promise<void> {
    await db.update(verificationCodes).set({ used: true }).where(eq(verificationCodes.id, id));
  }

  async cleanExpiredCodes(): Promise<void> {
    await db.delete(verificationCodes).where(lt(verificationCodes.expiresAt, new Date()));
  }

  async getWorkstreams(userId: string): Promise<Workstream[]> {
    return db.select().from(workstreams)
      .where(eq(workstreams.userId, userId))
      .orderBy(workstreams.order);
  }

  async createWorkstream(data: InsertWorkstream): Promise<Workstream> {
    const [ws] = await db.insert(workstreams).values(data).returning();
    return ws;
  }

  async updateWorkstream(id: string, userId: string, updates: Partial<Omit<InsertWorkstream, "userId">>): Promise<Workstream | undefined> {
    const [ws] = await db.update(workstreams)
      .set(updates)
      .where(and(eq(workstreams.id, id), eq(workstreams.userId, userId)))
      .returning();
    return ws;
  }

  async deleteWorkstream(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(workstreams)
      .where(and(eq(workstreams.id, id), eq(workstreams.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getLabels(userId: string): Promise<Label[]> {
    return db.select().from(labels).where(eq(labels.userId, userId));
  }

  async createLabel(data: InsertLabel): Promise<Label> {
    const [label] = await db.insert(labels).values(data).returning();
    return label;
  }

  async updateLabel(id: string, userId: string, updates: Partial<Omit<InsertLabel, "userId">>): Promise<Label | undefined> {
    const [label] = await db.update(labels)
      .set(updates)
      .where(and(eq(labels.id, id), eq(labels.userId, userId)))
      .returning();
    return label;
  }

  async deleteLabel(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(labels)
      .where(and(eq(labels.id, id), eq(labels.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async getTasks(userId: string, weekOf?: string): Promise<Task[]> {
    if (weekOf) {
      return db.select().from(tasks).where(
        and(
          eq(tasks.userId, userId),
          or(
            eq(tasks.weekOf, weekOf),
            eq(tasks.dayIndex, -1),
          )
        )
      );
    }
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(data: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  }

  async updateTask(id: string, userId: string, updates: Partial<Omit<InsertTask, "userId">>): Promise<Task | undefined> {
    const [task] = await db.update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return result.length > 0;
  }
  async getAiSuggestions(userId: string, status?: string): Promise<AiSuggestion[]> {
    if (status) {
      return db.select().from(aiSuggestions)
        .where(and(eq(aiSuggestions.userId, userId), eq(aiSuggestions.status, status)))
        .orderBy(desc(aiSuggestions.createdAt));
    }
    return db.select().from(aiSuggestions)
      .where(eq(aiSuggestions.userId, userId))
      .orderBy(desc(aiSuggestions.createdAt));
  }

  async createAiSuggestion(data: InsertAiSuggestion): Promise<AiSuggestion> {
    const [suggestion] = await db.insert(aiSuggestions).values(data).returning();
    return suggestion;
  }

  async updateAiSuggestionStatus(id: string, userId: string, status: string): Promise<AiSuggestion | undefined> {
    const [suggestion] = await db.update(aiSuggestions)
      .set({ status })
      .where(and(eq(aiSuggestions.id, id), eq(aiSuggestions.userId, userId)))
      .returning();
    return suggestion;
  }

  async deleteAiSuggestion(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(aiSuggestions)
      .where(and(eq(aiSuggestions.id, id), eq(aiSuggestions.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async clearAiSuggestions(userId: string, status?: string): Promise<void> {
    if (status) {
      await db.delete(aiSuggestions)
        .where(and(eq(aiSuggestions.userId, userId), eq(aiSuggestions.status, status)));
    } else {
      await db.delete(aiSuggestions)
        .where(eq(aiSuggestions.userId, userId));
    }
  }
}

export const storage = new DatabaseStorage();
