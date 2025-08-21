import { Bet } from "@shared/schema";

interface CurrentBetsProps {
  bets: Bet[];
  isLoading: boolean;
}

const colorConfig = {
  red: "border-bet-red bg-bet-red/10",
  green: "border-bet-green bg-bet-green/10",
  blue: "border-bet-blue bg-bet-blue/10", 
  purple: "border-bet-purple bg-bet-purple/10",
  orange: "border-bet-orange bg-bet-orange/10",
};

const colorDotConfig = {
  red: "bg-bet-red",
  green: "bg-bet-green",
  blue: "bg-bet-blue",
  purple: "bg-bet-purple", 
  orange: "bg-bet-orange",
};

export default function CurrentBets({ bets, isLoading }: CurrentBetsProps) {
  const totalBetAmount = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-electric-blue/30 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="fas fa-ticket-alt text-gold mr-2"></i>
          Your Bets This Round
        </h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-electric-blue/30 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-ticket-alt text-gold mr-2"></i>
        Your Bets This Round
      </h3>
      
      {bets.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <i className="fas fa-ticket-alt text-3xl mb-3 opacity-50"></i>
          <p>No bets placed for this round</p>
          <p className="text-sm mt-1">Choose a color and amount to place your bet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bets.map((bet) => (
            <div 
              key={bet.id} 
              className={`rounded-lg p-4 border-l-4 ${colorConfig[bet.color as keyof typeof colorConfig]}`}
              data-testid={`bet-${bet.color}-${bet.id}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${colorDotConfig[bet.color as keyof typeof colorDotConfig]}`}></div>
                  <span className="font-semibold">{bet.color.toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gold">₹{bet.amount}</div>
                  <div className="text-xs text-gray-400">
                    Potential win: ₹{(parseFloat(bet.amount) * 2).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {bets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Total Bet:</span>
            <span className="font-semibold text-gold" data-testid="text-total-bet">
              ₹{totalBetAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
