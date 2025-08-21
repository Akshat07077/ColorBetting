import { useEffect, useState } from "react";
import { GameRound, Bet } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface ResultModalProps {
  currentRound?: GameRound;
  userBets: Bet[];
}

const colorConfig = {
  red: "bg-bet-red",
  green: "bg-bet-green",
  blue: "bg-bet-blue",
  purple: "bg-bet-purple", 
  orange: "bg-bet-orange",
};

export default function ResultModal({ currentRound, userBets }: ResultModalProps) {
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{
    roundId: number;
    winningColor: string;
    message: string;
    totalWin: number;
  } | null>(null);

  useEffect(() => {
    if (currentRound?.status === "finished" && currentRound.winningColor && userBets.length > 0) {
      const winningBets = userBets.filter(bet => bet.color === currentRound.winningColor);
      const totalWin = winningBets.reduce((sum, bet) => sum + parseFloat(bet.winAmount || "0"), 0);
      const totalBetAmount = userBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
      
      let message = "";
      if (winningBets.length > 0) {
        const netWin = totalWin - totalBetAmount;
        message = `🎉 You Won! +₹${netWin.toFixed(2)}`;
      } else {
        message = `😔 Better luck next time! -₹${totalBetAmount.toFixed(2)}`;
      }

      setResultData({
        roundId: currentRound.id,
        winningColor: currentRound.winningColor,
        message,
        totalWin,
      });
      setShowResult(true);
    }
  }, [currentRound, userBets]);

  if (!showResult || !resultData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-gaming-dark to-gaming-blue rounded-3xl border border-electric-blue/50 p-8 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center">
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-bounce ${colorConfig[resultData.winningColor as keyof typeof colorConfig]}`}>
              <i className="fas fa-circle text-4xl text-white"></i>
            </div>
            <h2 className="text-2xl font-gaming font-bold mb-2">
              Round #{resultData.roundId} Result
            </h2>
            <p className="text-gray-300">Winning Color</p>
          </div>
          
          <div className="bg-black/40 rounded-2xl p-6 mb-6">
            <div className="text-4xl font-gaming font-black mb-2" style={{ color: `var(--bet-${resultData.winningColor})` }}>
              {resultData.winningColor.toUpperCase()}
            </div>
            <div className="text-gold font-semibold">{resultData.message}</div>
          </div>
          
          <Button
            onClick={() => setShowResult(false)}
            className="w-full bg-gradient-to-r from-electric-blue to-gold hover:from-electric-blue/80 hover:to-gold/80 text-white py-3 font-semibold transition-all"
            data-testid="button-continue-playing"
          >
            Continue Playing
          </Button>
        </div>
      </div>
    </div>
  );
}
