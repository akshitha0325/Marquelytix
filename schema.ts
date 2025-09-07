import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  source: text("source").notNull(), // "google"|"instagram"|"facebook"|"x"|"news"|"blog"|"video"|"podcast"|"tiktok"|"other"|"manual"
  authorId: varchar("author_id"),
  text: text("text").notNull(),
  lang: text("lang").default("en"),
  country: text("country").default("US"),
  createdAt: timestamp("created_at").defaultNow(),
  sentimentLabel: text("sentiment_label").notNull(), // "POSITIVE"|"NEUTRAL"|"NEGATIVE"
  sentimentScore: real("sentiment_score").notNull(),
  influence: integer("influence").default(0), // 0-10
});

export const authors = pgTable("authors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  handle: text("handle"),
  followers: integer("followers"),
  avatarUrl: text("avatar_url"),
  platform: text("platform"),
});

export const snapshots = pgTable("snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  ts: timestamp("ts").defaultNow(),
  mentions: integer("mentions").default(0),
  reach: integer("reach").default(0),
  avgScore: real("avg_score").default(0),
  pos: integer("pos").default(0),
  neu: integer("neu").default(0),
  neg: integer("neg").default(0),
});

export const config = pgTable("config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  huggingfaceToken: text("huggingface_token"),
  demoMode: text("demo_mode").default("true"),
  sentimentThreshold: real("sentiment_threshold").default(0.4),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  businessName: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  source: true,
  authorId: true,
  text: true,
  lang: true,
  country: true,
});

export const insertAuthorSchema = createInsertSchema(authors).pick({
  name: true,
  handle: true,
  followers: true,
  avatarUrl: true,
  platform: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertAuthor = z.infer<typeof insertAuthorSchema>;
export type Author = typeof authors.$inferSelect;
export type Snapshot = typeof snapshots.$inferSelect;
export type Config = typeof config.$inferSelect;

// Additional types for API responses
export const SentimentAnalysisResponseSchema = z.object({
  sentimentLabel: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  sentimentScore: z.number().min(0).max(1),
});

export type SentimentAnalysisResponse = z.infer<typeof SentimentAnalysisResponseSchema>;

export const TopicBreakdownSchema = z.object({
  label: z.string(),
  count: z.number(),
  score: z.number().optional(),
});

export type TopicBreakdown = z.infer<typeof TopicBreakdownSchema>;

export const GeoPointSchema = z.object({
  country: z.string(),
  mentions: z.number(),
  reach: z.number(),
  interactions: z.number(),
});

export type GeoPoint = z.infer<typeof GeoPointSchema>;

export const SuggestionSchema = z.object({
  id: z.string(),
  category: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  title: z.string(),
  body: z.string(),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;
