import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Wallet, ArrowRight, CheckCircle, Loader2, Star, Zap } from 'lucide-react';
import { soundManager } from '../utils/soundUtils';

const HomeWithdrawal = () => {
  const { state, dispatch } = useGame();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  const canWithdraw = state.balance >= state.withdrawalThreshold && state.phoneNumber;
  const progressPercentage = Math.min((state.balance / state.withdrawalThreshold) * 100, 100);

  const handleQuickWithdraw = async () => {
    if (!canWithdraw) return;

    soundManager.play('click');
    setIsWithdrawing(true);
    
    // Mock Mpesa withdrawal
    setTimeout(() => {
      const withdrawalAmount = state.balance;
      
      soundManager.play('cash'); // Play cash sound on successful withdrawal
      
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

  if (state.balance < 100) return null;

  return (
    <div className="relative group">
      {/* Subtle glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 animate-pulse"></div>
      
      <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-600/30 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 space-y-4">
          {/* Mobile-optimized header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-emerald-500/30">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg sm:text-xl">Your Earnings</h3>
                <p className="text-slate-300 text-sm flex items-center gap-1">
                  <Star className="w-3 h-3 text-emerald-400" />
                  Ready to cash out
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-lg">
                KSH {state.balance.toLocaleString()}
              </p>
              <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                {progressPercentage.toFixed(0)}% to withdraw
              </p>
            </div>
          </div>

          {/* Enhanced mobile progress bar */}
          <div className="space-y-2">
            <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Mobile-optimized withdraw button with sound */}
          <button
            onClick={handleQuickWithdraw}
            disabled={!canWithdraw || isWithdrawing}
            className={`w-full font-black py-4 sm:py-5 rounded-2xl transition-all duration-300 transform relative overflow-hidden text-base sm:text-lg ${
              canWithdraw && !isWithdrawing
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-700 text-white active:scale-95 shadow-xl hover:shadow-2xl'
                : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
            }`}
          >
            {/* Button shine effect */}
            {canWithdraw && !isWithdrawing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
            )}
            
            <span className="relative flex items-center justify-center gap-3">
              {isWithdrawing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : canWithdraw ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  💰 Withdraw to M-Pesa
                  <ArrowRight className="w-5 h-5 animate-bounce" />
                </>
              ) : !state.phoneNumber ? (
                <>
                  <span className="text-2xl">📱</span>
                  Add Phone Number
                </>
              ) : (
                <>
                  <span className="text-2xl">💰</span>
                  Need KSH {state.withdrawalThreshold - state.balance} more
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeWithdrawal;
