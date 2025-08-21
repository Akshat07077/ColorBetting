import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, gameRounds, bets, type User, type InsertUser, type GameRound, type Bet, type InsertBet, type Color, COLORS } from "@shared/schema";
import { eq, desc, and, or, isNotNull } from "drizzle-orm";
import { IStorage } from "./storage";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage implements IStorage {
  async initialize(): Promise<void> {
    // Create demo user if it doesn't exist
    const existingUser = await this.getUserByUsername("Player123");
    if (!existingUser) {
      await this.createUser({ username: "Player123" });
    }
  }
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ balance: newBalance.toFixed(2) })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async getCurrentRound(): Promise<GameRound | undefined> {
    const result = await db.select().from(gameRounds).orderBy(desc(gameRounds.id)).limit(1);
    return result[0];
  }

  async createRound(): Promise<GameRound> {
    // Get the highest ID to increment manually
    const lastRound = await db.select().from(gameRounds).orderBy(desc(gameRounds.id)).limit(1);
    const nextId = lastRound.length > 0 ? lastRound[0].id + 1 : 1001;
    
    const result = await db.insert(gameRounds).values({
      id: nextId,
      status: "betting",
      winningColor: null,
      startTime: new Date(),
      endTime: null,
      resultTime: null,
    }).returning();
    return result[0];
  }

  async updateRoundStatus(roundId: number, status: string, winningColor?: Color): Promise<GameRound | undefined> {
    const updateData: any = { status };
    
    if (status === "closed") {
      updateData.endTime = new Date();
    }
    
    if (status === "finished") {
      updateData.resultTime = new Date();
      if (winningColor) {
        updateData.winningColor = winningColor;
      }
    }

    const result = await db.update(gameRounds)
      .set(updateData)
      .where(eq(gameRounds.id, roundId))
      .returning();
    return result[0];
  }

  async getRecentRounds(limit: number): Promise<GameRound[]> {
    const result = await db.select().from(gameRounds)
      .where(eq(gameRounds.status, "finished"))
      .orderBy(desc(gameRounds.id))
      .limit(limit);
    return result;
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const result = await db.insert(bets).values(bet).returning();
    return result[0];
  }

  async getRoundBets(roundId: number): Promise<Bet[]> {
    const result = await db.select().from(bets).where(eq(bets.roundId, roundId));
    return result;
  }

  async getUserRoundBets(userId: string, roundId: number): Promise<Bet[]> {
    const result = await db.select().from(bets)
      .where(and(eq(bets.userId, userId), eq(bets.roundId, roundId)));
    return result;
  }

  async updateBetResult(betId: string, isWinner: boolean, winAmount: number): Promise<Bet | undefined> {
    const result = await db.update(bets)
      .set({ 
        isWinner, 
        winAmount: winAmount.toFixed(2) 
      })
      .where(eq(bets.id, betId))
      .returning();
    return result[0];
  }

  async getUserStats(userId: string): Promise<{
    gamesPlayed: number;
    totalWinnings: number;
    winRate: number;
    biggestWin: number;
    favoriteColor: Color;
  }> {
    const userBets = await db.select().from(bets)
      .where(and(eq(bets.userId, userId), isNotNull(bets.isWinner)));

    const gamesPlayed = userBets.length;
    const winningBets = userBets.filter(bet => bet.isWinner === true);
    const totalWinnings = winningBets.reduce((sum, bet) => sum + parseFloat(bet.winAmount || "0"), 0);
    const winRate = gamesPlayed > 0 ? (winningBets.length / gamesPlayed) * 100 : 0;
    const biggestWin = Math.max(...winningBets.map(bet => parseFloat(bet.winAmount || "0")), 0);

    // Calculate favorite color
    const colorCounts = COLORS.reduce((acc, color) => {
      acc[color] = userBets.filter(bet => bet.color === color).length;
      return acc;
    }, {} as Record<Color, number>);

    const favoriteColor = Object.entries(colorCounts).reduce((a, b) => 
      colorCounts[a[0] as Color] > colorCounts[b[0] as Color] ? a : b
    )[0] as Color || "green";

    return {
      gamesPlayed,
      totalWinnings,
      winRate,
      biggestWin,
      favoriteColor,
    };
  }
}