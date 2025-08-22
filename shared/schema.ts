import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameRounds = pgTable("game_rounds", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  status: text("status").notNull(), // "betting", "closed", "finished"
  winningColor: text("winning_color"), // "red", "green", "blue", "purple", "orange"
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  resultTime: timestamp("result_time"),
});

export const bets = pgTable("bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  roundId: integer("round_id").notNull(),
  color: text("color").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isWinner: boolean("is_winner"),
  winAmount: decimal("win_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const insertBetSchema = createInsertSchema(bets).pick({
  userId: true,
  roundId: true,
  color: true,
  amount: true,
});

export const insertRoundSchema = createInsertSchema(gameRounds).pick({
  status: true,
  startTime: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type GameRound = typeof gameRounds.$inferSelect;

export const COLORS = ["red", "green", "blue", "purple", "orange"] as const;
export type Color = typeof COLORS[number];
