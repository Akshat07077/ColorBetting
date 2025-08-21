import { GameRound } from "@shared/schema";

interface TimerProps {
  currentRound?: GameRound;
  timeLeft: number;
}

export default function Timer({ currentRound, timeLeft }: TimerProps) {
  const getStatusConfig = (status?: string, timeLeft?: number) => {
    if (!status) return { text: "Loading...", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    
    if (status === "betting" && timeLeft > 0) {
      return { text: "Betting Open", className: "bg-green-500/20 text-green-400 border-green-500/30" };
    } else if (status === "closed") {
      return { text: "Round Closed", className: "bg-red-500/20 text-red-400 border-red-500/30" };
    } else if (status === "finished") {
      return { text: "Round Finished", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    }
    
    return { text: "Round Closed", className: "bg-red-500/20 text-red-400 border-red-500/30" };
  };

  const statusConfig = getStatusConfig(currentRound?.status, timeLeft);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Calculate progress for circle (30 seconds total)
  const progress = ((30 - timeLeft) / 30) * 283; // 283 is approximate circumference

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-electric-blue/30 p-8 text-center">
      <div className="mb-4">
        <h2 className="text-lg font-ui font-semibold text-gray-300 mb-2">
          Round #<span data-testid="text-round-id">{currentRound?.id || 0}</span>
        </h2>
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusConfig.className}`}>
          <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
          <span data-testid="text-round-status">{statusConfig.text}</span>
        </div>
      </div>
      
      <div className="relative">
        <div className="text-6xl font-gaming font-black text-gold mb-2" data-testid="text-timer">
          <span className="tabular-nums">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <p className="text-gray-400 text-sm">Time remaining to place bets</p>
        
        {/* Progress circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-700"/>
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" 
              className="text-gold" 
              strokeLinecap="round" 
              strokeDasharray="283" 
              strokeDashoffset={progress}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
