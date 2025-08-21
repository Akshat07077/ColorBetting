import { User } from "@shared/schema";

interface HeaderProps {
  user?: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-black/30 backdrop-blur-sm border-b border-electric-blue/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-electric-blue to-gold rounded-lg flex items-center justify-center">
              <i className="fas fa-palette text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-gaming font-bold bg-gradient-to-r from-gold to-electric-blue bg-clip-text text-transparent">
              ColorPredict
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-black/40 rounded-lg px-4 py-2 border border-gold/30">
              <div className="flex items-center space-x-2">
                <i className="fas fa-coins text-gold"></i>
                <span className="text-sm text-gray-300">Balance:</span>
                <span className="font-gaming font-bold text-gold" data-testid="text-balance">
                  ₹{user?.balance || "0.00"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-electric-blue to-purple-500 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
              <span className="text-sm font-medium" data-testid="text-username">
                {user?.username || "Guest"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}