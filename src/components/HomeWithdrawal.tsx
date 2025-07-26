import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Wallet, ArrowRight, CheckCircle, Loader2, Star, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/soundUtils';
import WithdrawalModal from './WithdrawalModal';

const HomeWithdrawal = () => {
  const { state, dispatch } = useGame();
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  
  const minWithdrawal = 1000;
  const canWithdraw = state.balance >= minWithdrawal;
  const progressPercentage = Math.min((state.balance / minWithdrawal) * 100, 100);

  const handleWithdrawClick = () => {
    soundManager.play('click');
    setShowWithdrawalModal(true);
  };

  if (state.balance < 100) return null;

  return (
    <div className="relative group touch-manipulation">
      {/* Enhanced mobile glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 rounded-2xl sm:rounded-3xl blur-lg opacity-30 group-hover:opacity-50 group-active:opacity-60 animate-pulse transition-opacity duration-300"></div>
      
      <div className="relative bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl border border-emerald-500/20 overflow-hidden hover-lift">
        {/* Mobile touch indicator */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-600/50 rounded-full sm:hidden"></div>
        {/* Enhanced animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 space-y-3 sm:space-y-4 pt-1 sm:pt-0">
          {/* Mobile-first optimized header */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-sm border border-emerald-500/40 shadow-lg flex-shrink-0">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                {state.balance >= minWithdrawal && (
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-black text-base sm:text-lg lg:text-xl flex items-center gap-1 sm:gap-2 truncate">
                  <span className="truncate">Your Balance</span>
                  {canWithdraw && <span className="text-emerald-400 animate-pulse flex-shrink-0">💰</span>}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-1 truncate">
                  <TrendingUp className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{canWithdraw ? 'Ready to withdraw!' : 'Keep spinning to earn more'}</span>
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
                KSH {state.balance.toLocaleString()}
              </p>
              <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-1 justify-end">
                <Zap className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{progressPercentage >= 100 ? 'Ready!' : `${progressPercentage.toFixed(0)}%`}</span>
              </p>
            </div>
          </div>

          {/* Mobile-optimized progress bar with enhanced effects */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-slate-300 font-medium truncate">Progress</span>
              <span className="text-emerald-400 font-bold flex-shrink-0">
                <span className="hidden sm:inline">KSH {Math.min(state.balance, minWithdrawal).toLocaleString()} / {minWithdrawal.toLocaleString()}</span>
                <span className="sm:hidden">{Math.min(state.balance, minWithdrawal).toLocaleString()}/{minWithdrawal.toLocaleString()}</span>
              </span>
            </div>
            <div className="relative w-full bg-slate-700/50 rounded-full h-3 sm:h-4 overflow-hidden backdrop-blur-sm border border-slate-600/30 progress-bar">
              <div 
                className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${
                  progressPercentage >= 100 
                    ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse-glow' 
                    : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600'
                }`}
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                {progressPercentage >= 100 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent animate-ping"></div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile-optimized stunning withdraw button */}
          <button
            onClick={handleWithdrawClick}
            className={`w-full font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all duration-200 transform relative overflow-hidden text-sm sm:text-base lg:text-lg group touch-manipulation ${
              canWithdraw
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-700 text-white active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 btn-withdraw'
                : state.balance > 0
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25'
                : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
            }`}
            style={{ touchAction: 'manipulation', minHeight: '56px' }}
          >
            {/* Enhanced mobile button effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-shimmer"></div>
            {canWithdraw && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent animate-ping"></div>
            )}
            
            <span className="relative flex items-center justify-center gap-2 sm:gap-3">
              {canWithdraw ? (
                <>
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce flex-shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">💰 Withdraw KSH {state.balance.toLocaleString()}</span>
                    <span className="sm:hidden">💰 Withdraw</span>
                  </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </>
              ) : state.balance > 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">💎 Withdraw to M-Pesa</span>
                    <span className="sm:hidden">💎 Withdraw</span>
                  </span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse flex-shrink-0" />
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">🎯 Start Spinning to Earn</span>
                    <span className="sm:hidden">🎯 Start Spinning</span>
                  </span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
      
      {/* Stunning Withdrawal Modal */}
      <WithdrawalModal 
        isOpen={showWithdrawalModal} 
        onClose={() => setShowWithdrawalModal(false)} 
      />
    </div>
  );
};

export default HomeWithdrawal;
