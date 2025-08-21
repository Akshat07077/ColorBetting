interface PlayerStatsProps {
  stats?: {
    gamesPlayed: number;
    totalWinnings: number;
    winRate: number;
    biggestWin: number;
    favoriteColor: string;
  };
}

const colorConfig = {
  red: "bg-bet-red",
  green: "bg-bet-green",
  blue: "bg-bet-blue", 
  purple: "bg-bet-purple",
  orange: "bg-bet-orange",
};

export default function PlayerStats({ stats }: PlayerStatsProps) {
  if (!stats) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-electric-blue/30 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <i className="fas fa-chart-line text-gold mr-2"></i>
          Your Stats
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-electric-blue/30 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-chart-line text-gold mr-2"></i>
        Your Stats
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Games Played:</span>
          <span className="font-semibold" data-testid="text-games-played">{stats.gamesPlayed}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Win Rate:</span>
          <span className="font-semibold text-green-400" data-testid="text-win-rate">
            {stats.winRate.toFixed(1)}%
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Total Winnings:</span>
          <span className="font-semibold text-gold" data-testid="text-total-winnings">
            ₹{stats.totalWinnings.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Biggest Win:</span>
          <span className="font-semibold text-gold" data-testid="text-biggest-win">
            ₹{stats.biggestWin.toFixed(2)}
          </span>
        </div>
        
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400 mb-2">Favorite Color:</div>
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${colorConfig[stats.favoriteColor as keyof typeof colorConfig]}`}></div>
            <span className="font-medium" data-testid="text-favorite-color">
              {stats.favoriteColor.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
