import { type User, type InsertUser, type GameRound, type Bet, type InsertBet, type Color, COLORS } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, newBalance: number): Promise<User | undefined>;

  // Round operations
  getCurrentRound(): Promise<GameRound | undefined>;
  createRound(): Promise<GameRound>;
  updateRoundStatus(roundId: number, status: string, winningColor?: Color): Promise<GameRound | undefined>;
  getRecentRounds(limit: number): Promise<GameRound[]>;

  // Bet operations
  createBet(bet: InsertBet): Promise<Bet>;
  getRoundBets(roundId: number): Promise<Bet[]>;
  getUserRoundBets(userId: string, roundId: number): Promise<Bet[]>;
  updateBetResult(betId: string, isWinner: boolean, winAmount: number): Promise<Bet | undefined>;
  getUserStats(userId: string): Promise<{
    gamesPlayed: number;
    totalWinnings: number;
    winRate: number;
    biggestWin: number;
    favoriteColor: Color;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rounds: Map<number, GameRound>;
  private bets: Map<string, Bet>;
  private currentRoundId: number;

  constructor() {
    this.users = new Map();
    this.rounds = new Map();
    this.bets = new Map();
    this.currentRoundId = 1000;

    // Create initial user for demo
    this.createUser({ username: "Player123" });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      balance: "1000.00",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, balance: newBalance.toFixed(2) };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getCurrentRound(): Promise<GameRound | undefined> {
    return Array.from(this.rounds.values())
      .sort((a, b) => b.id - a.id)[0];
  }

  async createRound(): Promise<GameRound> {
    this.currentRoundId++;
    const round: GameRound = {
      id: this.currentRoundId,
      status: "betting",
      winningColor: null,
      startTime: new Date(),
      endTime: null,
      resultTime: null,
    };
    this.rounds.set(this.currentRoundId, round);
    return round;
  }

  async updateRoundStatus(roundId: number, status: string, winningColor?: Color): Promise<GameRound | undefined> {
    const round = this.rounds.get(roundId);
    if (!round) return undefined;

    const updatedRound = {
      ...round,
      status,
      winningColor: winningColor || round.winningColor,
      endTime: status === "closed" ? new Date() : round.endTime,
      resultTime: status === "finished" ? new Date() : round.resultTime,
    };
    this.rounds.set(roundId, updatedRound);
    return updatedRound;
  }

  async getRecentRounds(limit: number): Promise<GameRound[]> {
    return Array.from(this.rounds.values())
      .filter(round => round.status === "finished")
      .sort((a, b) => b.id - a.id)
      .slice(0, limit);
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = randomUUID();
    const bet: Bet = {
      ...insertBet,
      id,
      isWinner: null,
      winAmount: null,
      createdAt: new Date(),
    };
    this.bets.set(id, bet);
    return bet;
  }

  async getRoundBets(roundId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.roundId === roundId);
  }

  async getUserRoundBets(userId: string, roundId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter(bet => bet.userId === userId && bet.roundId === roundId);
  }

  async updateBetResult(betId: string, isWinner: boolean, winAmount: number): Promise<Bet | undefined> {
    const bet = this.bets.get(betId);
    if (!bet) return undefined;

    const updatedBet = {
      ...bet,
      isWinner,
      winAmount: winAmount.toFixed(2),
    };
    this.bets.set(betId, updatedBet);
    return updatedBet;
  }

  async getUserStats(userId: string): Promise<{
    gamesPlayed: number;
    totalWinnings: number;
    winRate: number;
    biggestWin: number;
    favoriteColor: Color;
  }> {
    const userBets = Array.from(this.bets.values())
      .filter(bet => bet.userId === userId && bet.isWinner !== null);

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

import { DatabaseStorage } from "./db-storage";

export const storage = new DatabaseStorage();
