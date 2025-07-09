
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CheckCircle, Loader2, TrendingUp, Target, Gift, Zap, Wallet } from 'lucide-react';

const GameStats = () => {
  const { state, dispatch } = useGame();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const progressPercentage = Math.min((state.balance / state.withdrawalThreshold) * 100, 100);
  const canWithdraw = state.balance >= state.withdrawalThreshold;

  const handleWithdrawal = async () => {
    if (!canWithdraw || !state.phoneNumber) {
      alert('Please add your phone number first or reach the minimum withdrawal amount.');
      return;
    }

    setIsWithdrawing(true);
    
    setTimeout(() => {
      const withdrawalAmount = state.balance;
      
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: Date.now().toString(),
          type: 'withdrawal',
          amount: withdrawalAmount,
          timestamp: new Date(),
          status: 'completed'
        }
      });
      
      dispatch({ type: 'SUBTRACT_BALANCE', payload: withdrawalAmount });
      setIsWithdrawing(false);
      
      alert(`Successfully withdrawn KSH ${withdrawalAmount} to ${state.phoneNumber}!`);
    }, 3000);
  };

  return (
    <div className="relative group">
      {/* Mobile glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl blur opacity-40 group-hover:opacity-60 animate-pulse"></div>
      
      <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <h3 className="text-white text-lg sm:text-xl font-bold">Game Progress</h3>
        </div>
        
        {/* Enhanced Mobile Progress Section */}
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-white/80 text-sm font-medium">Withdrawal Goal</span>
            </div>
            <span className="text-emerald-400 font-bold text-sm">{progressPercentage.toFixed(1)}%</span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                KSH {state.balance.toLocaleString()} / {state.withdrawalThreshold.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-400/30 text-center">
            <div className="text-2xl sm:text-3xl font-black text-white mb-1">{state.totalSpins}</div>
            <div className="text-blue-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Total Spins
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-4 border border-emerald-400/30 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300 mb-1">{state.freeSpins}</div>
            <div className="text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
              <Gift className="w-3 h-3" />
              Free Spins
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_PAYMENT_MODAL' })}
            className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform active:scale-95 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            <span className="relative flex items-center justify-center gap-2 text-sm sm:text-base">
              <span className="text-xl">💳</span>
              Top Up via M-Pesa
            </span>
          </button>
          
          <button
            onClick={handleWithdrawal}
            disabled={!canWithdraw || isWithdrawing || !state.phoneNumber}
            className={`w-full font-bold py-4 rounded-2xl transition-all duration-300 transform relative overflow-hidden text-sm sm:text-base ${
              canWithdraw && state.phoneNumber && !isWithdrawing
                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 text-white active:scale-95 shadow-xl'
                : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            {canWithdraw && state.phoneNumber && !isWithdrawing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            )}
            
            <span className="relative flex items-center justify-center gap-2">
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : canWithdraw && state.phoneNumber ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  💰 Withdraw Now
                </>
              ) : !state.phoneNumber ? (
                <>
                  <span className="text-lg">📱</span>
                  Add Phone Number
                </>
              ) : (
                <>
                  <span className="text-lg">💰</span>
                  Need KSH {state.withdrawalThreshold - state.balance} more
                </>
              )}
            </span>
          </button>
        </div>

        {/* Enhanced Mobile Recent Activity with Current Balance */}
        <div className="mt-6">
          {/* Current Balance Display */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl p-4 border border-emerald-400/30 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold text-sm">Current Balance</span>
              </div>
              <span className="text-2xl font-black text-emerald-400">
                KSH {state.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          {state.transactions.length > 0 && (
            <>
              <h4 className="text-white font-semibold mb-3 text-center">Recent Activity</h4>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {state.transactions.slice(0, 2).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center text-xs sm:text-sm bg-white/5 rounded-xl p-3 border border-white/10">
                    <span className="text-white/80 flex items-center gap-2">
                      <span className="text-lg">
                        {transaction.type === 'win' ? '🎉' : transaction.type === 'deposit' ? '💳' : '💰'}
                      </span>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                    <span className={`font-bold ${
                      transaction.type === 'win' || transaction.type === 'deposit' 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                    }`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}KSH {transaction.amount}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameStats;
