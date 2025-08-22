import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBetSchema, COLORS } from "@shared/schema";
import { z } from "zod";

let gameInterval: NodeJS.Timeout | null = null;

async function startGameLoop() {
  // Create initial round
  await storage.createRound();

  gameInterval = setInterval(async () => {
    try {
      const currentRound = await storage.getCurrentRound();
      if (!currentRound) return;

      if (currentRound.status === "betting") {
        // Close betting after 25 seconds
        const now = new Date();
        const startTime = new Date(currentRound.startTime);
        const elapsed = (now.getTime() - startTime.getTime()) / 1000;

        if (elapsed >= 25) {
          await storage.updateRoundStatus(currentRound.id, "closed");
          
          // Determine winner after 3 seconds
          setTimeout(async () => {
            const winningColor = COLORS[Math.floor(Math.random() * COLORS.length)];
            await storage.updateRoundStatus(currentRound.id, "finished", winningColor);
            
            // Process bets
            const roundBets = await storage.getRoundBets(currentRound.id);
            for (const bet of roundBets) {
              const isWinner = bet.color === winningColor;
              const winAmount = isWinner ? parseFloat(bet.amount) * 2 : 0;
              
              await storage.updateBetResult(bet.id, isWinner, winAmount);
              
              // Update user balance
              const user = await storage.getUser(bet.userId);
              if (user) {
                const currentBalance = parseFloat(user.balance);
                const balanceChange = isWinner ? winAmount - parseFloat(bet.amount) : -parseFloat(bet.amount);
                await storage.updateUserBalance(bet.userId, currentBalance + balanceChange);
              }
            }
            
            // Create new round after 2 seconds
            setTimeout(async () => {
              await storage.createRound();
            }, 2000);
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Game loop error:", error);
    }
  }, 1000);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database storage
  if ('initialize' in storage) {
    await (storage as any).initialize();
  }
  
  // Ensure there's always a betting round running
  const currentRound = await storage.getCurrentRound();
  if (!currentRound || currentRound.status === "finished") {
    await storage.createRound();
    console.log("Created initial betting round");
  }
  
  // Start game loop
  startGameLoop();

  // Get current game state
  app.get("/api/game/state", async (req, res) => {
    try {
      const currentRound = await storage.getCurrentRound();
      const recentRounds = await storage.getRecentRounds(10);
      
      let timeLeft = 0;
      if (currentRound && currentRound.status === "betting") {
        const now = new Date();
        const startTime = new Date(currentRound.startTime);
        const elapsed = (now.getTime() - startTime.getTime()) / 1000;
        timeLeft = Math.max(0, 25 - elapsed);
      }

      res.json({
        currentRound,
        timeLeft: Math.ceil(timeLeft),
        recentRounds,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get game state" });
    }
  });

  // Get user data
  app.get("/api/user", async (req, res) => {
    try {
      // For demo, return the first user
      const users = await Promise.all([storage.getUserByUsername("Player123")]);
      const user = users[0];
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await storage.getUserStats(user.id);
      
      res.json({
        user,
        stats,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Get user bets for current round
  app.get("/api/user/bets/current", async (req, res) => {
    try {
      const user = await storage.getUserByUsername("Player123");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentRound = await storage.getCurrentRound();
      if (!currentRound) {
        return res.json([]);
      }

      const bets = await storage.getUserRoundBets(user.id, currentRound.id);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user bets" });
    }
  });

  // Place bet
  app.post("/api/bets", async (req, res) => {
    try {
      const betData = insertBetSchema.parse(req.body);
      
      const currentRound = await storage.getCurrentRound();
      if (!currentRound || currentRound.status !== "betting") {
        return res.status(400).json({ message: "Betting is not currently open" });
      }

      const user = await storage.getUser(betData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const betAmount = parseFloat(betData.amount);
      const userBalance = parseFloat(user.balance);

      if (betAmount > userBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      if (betAmount < 10) {
        return res.status(400).json({ message: "Minimum bet amount is ₹10" });
      }

      // Validate color
      if (!COLORS.includes(betData.color as any)) {
        return res.status(400).json({ message: "Invalid color" });
      }

      const bet = await storage.createBet({
        ...betData,
        roundId: currentRound.id,
      });

      res.json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bet data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  const httpServer = createServer(app);

  // Cleanup on server shutdown
  process.on('SIGTERM', () => {
    if (gameInterval) {
      clearInterval(gameInterval);
    }
  });

  return httpServer;
}
