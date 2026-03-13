import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const verificationCodes = pgTable("verification_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
});

export const workstreams = pgTable("workstreams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull(),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const labels = pgTable("labels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  workstreamId: varchar("workstream_id").notNull().references(() => workstreams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  workstreamId: varchar("workstream_id").notNull().references(() => workstreams.id, { onDelete: "cascade" }),
  dayIndex: integer("day_index").notNull().default(0),
  weekOf: text("week_of"),
  completed: boolean("completed").notNull().default(false),
  labelIds: text("label_ids").array().notNull().default(sql`'{}'::text[]`),
  priority: text("priority").notNull().default("none"),
  description: text("description").default(""),
  externalLink: text("external_link"),
  timeEstimate: text("time_estimate"),
});

export const aiSuggestions = pgTable("ai_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").default(""),
  suggestedWorkstreamId: varchar("suggested_workstream_id").references(() => workstreams.id, { onDelete: "set null" }),
  suggestedDayIndex: integer("suggested_day_index").notNull().default(-1),
  priority: text("priority").notNull().default("none"),
  source: text("source").notNull().default("general"),
  sourcePreview: text("source_preview").default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({ id: true });
export const insertWorkstreamSchema = createInsertSchema(workstreams).omit({ id: true });
export const insertLabelSchema = createInsertSchema(labels).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type Workstream = typeof workstreams.$inferSelect;
export type InsertWorkstream = z.infer<typeof insertWorkstreamSchema>;
export type Label = typeof labels.$inferSelect;
export type InsertLabel = z.infer<typeof insertLabelSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
