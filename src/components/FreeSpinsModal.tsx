
import React, { useState } from 'react';
import { Gift, Coins, Zap } from 'lucide-react';

interface FreeSpinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: () => void;
}

const FreeSpinsModal: React.FC<FreeSpinsModalProps> = ({ isOpen, onClose, onDeposit }) => {
  const [showTopUpOptions, setShowTopUpOptions] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  if (!isOpen) return null;

  const handleTopUpOption = (amount: number) => {
    // Here you would handle the actual payment processing
    console.log(`Top up with KSH ${amount}`);
    onDeposit();
  };

  const handleCustomAmount = () => {
    const amount = parseInt(customAmount);
    if (amount >= 50) {
      handleTopUpOption(amount);
    } else {
      alert('Minimum top-up amount is KSH 50');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-8 border-2 border-yellow-400/30 w-full max-w-md relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-20 h-20 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-400 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          {!showTopUpOptions ? (
            <>
              {/* Header with animated icons */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Gift className="w-16 h-16 text-yellow-400 animate-bounce" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Out of Free Spins!
              </h2>
              
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                You have run out of free spins. Top up to continue spinning and get more chances to win big!
              </p>

              {/* Benefits list */}
              <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/20">
                <h3 className="text-yellow-400 font-semibold mb-3 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5" />
                  Top Up Benefits
                </h3>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>More spins = More chances to win</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-400" />
                    <span>Deposit KSH 100+ get 2 bonus spins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">💰</span>
                    <span>Withdraw winnings at KSH 2,500</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowTopUpOptions(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Coins className="w-5 h-5" />
                    💳 Get More Spins
                  </span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-medium py-3 rounded-xl transition-all duration-300"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Top-up options */}
              <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Choose Top-Up Amount
              </h2>

              <div className="space-y-3 mb-6">
                {[50, 100, 150].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleTopUpOption(amount)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    KSH {amount} {amount >= 100 && '🎁 +2 Bonus Spins'}
                  </button>
                ))}
                
                {/* Custom amount */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <label className="text-white font-semibold mb-2 block">Enter Custom Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Min KSH 50"
                      className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50"
                      min="50"
                    />
                    <button
                      onClick={handleCustomAmount}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Top Up
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTopUpOptions(false)}
                className="w-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-medium py-3 rounded-xl transition-all duration-300"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeSpinsModal;
