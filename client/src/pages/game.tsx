import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Timer from "@/components/game/timer";
import BettingArea from "@/components/game/betting-area";
import CurrentBets from "@/components/game/current-bets";
import RecentResults from "@/components/game/recent-results";
import PlayerStats from "@/components/game/player-stats";
import ResultModal from "@/components/game/result-modal";

export default function GamePage() {
  const { data: gameState, isLoading: gameLoading } = useQuery({
    queryKey: ["/api/game/state"],
    refetchInterval: 1000,
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/user"],
    refetchInterval: 5000,
  });

  const { data: currentBets, isLoading: betsLoading } = useQuery({
    queryKey: ["/api/user/bets/current"],
    refetchInterval: 2000,
  });

  if (gameLoading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-blue to-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-gaming">Loading Game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-blue to-gaming-dark font-ui text-white">
      <Header user={userData?.user} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Timer 
              currentRound={gameState?.currentRound}
              timeLeft={gameState?.timeLeft || 0}
            />
            
            <BettingArea 
              currentRound={gameState?.currentRound}
              userBalance={userData?.user?.balance}
            />
            
            <CurrentBets 
              bets={currentBets || []}
              isLoading={betsLoading}
            />
          </div>
          
          <div className="space-y-6">
            <RecentResults results={gameState?.recentRounds || []} />
            <PlayerStats stats={userData?.stats} />
          </div>
        </div>
      </main>

      <ResultModal 
        currentRound={gameState?.currentRound}
        userBets={currentBets || []}
      />
    </div>
  );
}
