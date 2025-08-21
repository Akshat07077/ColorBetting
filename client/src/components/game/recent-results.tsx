import { GameRound } from "@shared/schema";

interface RecentResultsProps {
  results: GameRound[];
}

const colorConfig = {
  red: "bg-bet-red",
  green: "bg-bet-green", 
  blue: "bg-bet-blue",
  purple: "bg-bet-purple",
  orange: "bg-bet-orange",
};

export default function RecentResults({ results }: RecentResultsProps) {
  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const resultTime = new Date(date);
    const diffMs = now.getTime() - resultTime.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    
    if (diffMin < 1) return "Just now";
    if (diffMin === 1) return "1 min ago";
    return `${diffMin} min ago`;
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-electric-blue/30 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-history text-gold mr-2"></i>
        Recent Results
      </h3>
      
      {results.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <i className="fas fa-history text-3xl mb-3 opacity-50"></i>
          <p>No recent results</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <div 
              key={result.id} 
              className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3"
              data-testid={`result-${result.id}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">#{result.id}</span>
                <div className={`w-6 h-6 rounded-full ${colorConfig[result.winningColor as keyof typeof colorConfig]}`}></div>
                <span className="font-medium">{result.winningColor?.toUpperCase()}</span>
              </div>
              <span className="text-xs text-gray-400">
                {result.resultTime ? formatTimeAgo(result.resultTime) : "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
