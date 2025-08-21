import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { GameRound, COLORS } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BettingAreaProps {
  currentRound?: GameRound;
  userBalance?: string;
}

const colorConfig = {
  red: "bg-bet-red hover:bg-bet-red/80",
  green: "bg-bet-green hover:bg-bet-green/80", 
  blue: "bg-bet-blue hover:bg-bet-blue/80",
  purple: "bg-bet-purple hover:bg-bet-purple/80",
  orange: "bg-bet-orange hover:bg-bet-orange/80",
};

export default function BettingArea({ currentRound, userBalance }: BettingAreaProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const placeBetMutation = useMutation({
    mutationFn: async ({ color, amount }: { color: string; amount: number }) => {
      // For demo, use the first user
      const userResponse = await apiRequest("GET", "/api/user");
      const userData = await userResponse.json();
      
      if (!currentRound) {
        throw new Error("No active round");
      }
      
      return apiRequest("POST", "/api/bets", {
        userId: userData.user.id,
        roundId: currentRound.id,
        color,
        amount: amount.toString(),
      });
    },
    onSuccess: () => {
      toast({
        title: "Bet Placed Successfully",
        description: "Your bet has been placed for this round.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/bets/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setCustomAmount("");
      setSelectedAmount(0);
    },
    onError: (error: any) => {
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet",
        variant: "destructive",
      });
    },
  });

  const handleColorClick = (color: string) => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a bet amount",
        variant: "destructive",
      });
      return;
    }

    if (currentRound?.status !== "betting") {
      toast({
        title: "Betting Closed",
        description: "Betting is not currently open",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate({ color, amount });
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const isBettingOpen = currentRound?.status === "betting";

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-electric-blue/30 p-6">
      <h3 className="text-xl font-semibold mb-6 text-center">Choose Your Color</h3>
      
      {/* Color betting options */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {COLORS.map((color) => (
          <Button
            key={color}
            disabled={!isBettingOpen || placeBetMutation.isPending}
            onClick={() => handleColorClick(color)}
            className={`group relative ${colorConfig[color]} rounded-xl p-6 transition-all duration-200 hover:scale-105 border-2 border-transparent hover:border-white/30 h-auto`}
            data-testid={`button-bet-${color}`}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center group-hover:bg-white/30">
                <i className="fas fa-circle text-2xl"></i>
              </div>
              <span className="font-semibold text-sm">{color.toUpperCase()}</span>
              <div className="text-xs text-white/70 mt-1">2.0x</div>
            </div>
          </Button>
        ))}
      </div>
      
      {/* Bet amount selection */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-300">Bet Amount</h4>
        <div className="grid grid-cols-4 gap-3">
          {[10, 50, 100, 250].map((amount) => (
            <Button
              key={amount}
              variant={selectedAmount === amount ? "default" : "secondary"}
              onClick={() => handleAmountSelect(amount)}
              className={`py-3 px-4 font-semibold transition-colors ${
                selectedAmount === amount 
                  ? "bg-electric-blue hover:bg-electric-blue/80" 
                  : "bg-gray-700 hover:bg-electric-blue text-white"
              }`}
              data-testid={`button-amount-${amount}`}
            >
              ₹{amount}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <Input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(0);
            }}
            className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-electric-blue"
            data-testid="input-custom-amount"
          />
          <div className="text-right text-sm text-gray-400">
            <div>Balance: ₹{userBalance || "0.00"}</div>
          </div>
        </div>
        
        {!isBettingOpen && (
          <div className="text-center text-yellow-400 text-sm font-medium">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Betting is currently closed
          </div>
        )}
      </div>
    </div>
  );
}
