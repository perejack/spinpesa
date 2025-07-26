import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Smartphone, 
  CreditCard,
  TrendingUp,
  Zap,
  Star,
  Gift,
  Loader2,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../utils/soundUtils';
import TopUpModal from './TopUpModal';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useGame();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [animateCoins, setAnimateCoins] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(state.phoneNumber || '');
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const minWithdrawal = 1000;
  const canWithdraw = state.balance >= minWithdrawal && phoneNumber.length >= 10;
  const progressPercentage = Math.min((state.balance / minWithdrawal) * 100, 100);

  useEffect(() => {
    if (isOpen) {
      setAnimateCoins(true);
      soundManager.play('click');
    }
  }, [isOpen]);

  const handleWithdraw = async () => {
    if (!canWithdraw) return;
    
    soundManager.play('click');
    setIsWithdrawing(true);
    
    // Simulate withdrawal process
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
      dispatch({ type: 'SET_PHONE_NUMBER', payload: phoneNumber });
      
      setIsWithdrawing(false);
      setShowSuccess(true);
      soundManager.play('cash');
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    }, 2500);
  };

  const handleTopUp = () => {
    soundManager.play('click');
    setShowTopUpModal(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in px-4 py-6 sm:px-6">
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto animate-slide-up">
        {/* Mobile-first design optimization */}
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400/30 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Main modal container - Mobile optimized */}
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-500/20 overflow-hidden max-h-[90vh] overflow-y-auto">
          {/* Mobile scroll indicator */}
          <div className="sticky top-0 w-full h-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500/40 to-emerald-500/20 z-10"></div>
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-3xl blur-xl animate-pulse"></div>
          
          {/* Enhanced mobile close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-12 h-12 sm:w-10 sm:h-10 bg-slate-700/80 hover:bg-slate-600/80 active:bg-slate-500/80 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={22} className="text-white sm:w-5 sm:h-5" />
          </button>

          {/* Success overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-3xl">
              <div className="text-center text-white animate-bounce">
                <CheckCircle size={64} className="mx-auto mb-4 text-emerald-200" />
                <h3 className="text-2xl font-black mb-2">Withdrawal Successful!</h3>
                <p className="text-emerald-100">Money sent to {phoneNumber}</p>
              </div>
            </div>
          )}

          <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6 pb-6 sm:pb-8">
            {/* Mobile-optimized header with animated wallet */}
            <div className="text-center space-y-3 sm:space-y-4 pt-2">
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <Wallet size={28} className="text-white sm:w-8 sm:h-8" />
                {animateCoins && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-bounce">
                    <span className="text-xs">💰</span>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2">Cash Out</h2>
                <p className="text-slate-300 text-sm sm:text-base">Withdraw your winnings instantly</p>
              </div>
            </div>

            {/* Mobile-optimized current balance display */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-500/30 hover-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-xs sm:text-sm">Current Balance</p>
                    <p className="text-xl sm:text-2xl font-black text-white">KSH {state.balance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-400 text-xs sm:text-sm">
                    <Star size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Available</span>
                    <span className="sm:hidden">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-optimized minimum withdrawal info */}
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-500/30">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm sm:text-base">Minimum Withdrawal</p>
                  <p className="text-amber-200 text-xs sm:text-sm">KSH 1,000 required</p>
                </div>
                <div className="text-lg sm:text-2xl font-black text-amber-400">
                  KSH 1,000
                </div>
              </div>
              
              {/* Mobile-optimized progress bar */}
              <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-300">Progress</span>
                  <span className="text-amber-400 font-bold">{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3 sm:h-2 overflow-hidden progress-bar">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-1000 relative"
                    style={{ width: `${progressPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-optimized phone number input */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                <Smartphone size={16} className="text-emerald-400 sm:w-[18px] sm:h-[18px]" />
                M-Pesa Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg sm:rounded-xl px-3 py-3 sm:px-4 sm:py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 text-base touch-manipulation"
                  style={{ fontSize: '16px', touchAction: 'manipulation' }}
                  inputMode="tel"
                  autoComplete="tel"
                />
                <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-md sm:rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-optimized action buttons */}
            <div className="space-y-3 sm:space-y-4">
              {/* Enhanced mobile withdraw button */}
              <button
                onClick={handleWithdraw}
                disabled={!canWithdraw || isWithdrawing}
                className={`w-full font-black py-4 sm:py-5 rounded-lg sm:rounded-xl transition-all duration-200 transform relative overflow-hidden text-base sm:text-lg touch-manipulation ${
                  canWithdraw && !isWithdrawing
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-700 text-white active:scale-95 shadow-xl hover:shadow-2xl btn-withdraw'
                    : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                }`}
                style={{ touchAction: 'manipulation', minHeight: '56px' }}
              >
                {/* Button shine effect */}
                {canWithdraw && !isWithdrawing && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                )}
                
                <span className="relative flex items-center justify-center gap-3">
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Withdrawal...
                    </>
                  ) : canWithdraw ? (
                    <>
                      <Wallet className="w-5 h-5" />
                      Withdraw KSH {state.balance.toLocaleString()}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : state.balance < minWithdrawal ? (
                    <>
                      <AlertTriangle className="w-5 h-5 animate-pulse text-red-400" />
                      <span className="animate-pulse text-red-300">
                        Need KSH {(minWithdrawal - state.balance).toLocaleString()} More
                      </span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-5 h-5" />
                      Enter Valid Phone Number
                    </>
                  )}
                </span>
              </button>

              {/* Enhanced mobile top up button */}
              {state.balance < minWithdrawal && (
                <button
                  onClick={handleTopUp}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-4 sm:py-5 rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden touch-manipulation"
                  style={{ touchAction: 'manipulation', minHeight: '56px' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse"></div>
                  <span className="relative flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg">
                    <CreditCard className="w-5 h-5" />
                    <span className="hidden sm:inline">Top Up with M-Pesa</span>
                    <span className="sm:hidden">Top Up M-Pesa</span>
                    <Zap className="w-5 h-5" />
                  </span>
                </button>
              )}
              
              {/* Enhanced bonus messaging for top-up incentive */}
              {state.balance < minWithdrawal && (
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-yellow-500/30 animate-pulse">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-yellow-200 font-bold text-sm sm:text-base mb-1">🎁 Bonus Rewards!</h4>
                      <ul className="text-yellow-100 text-xs sm:text-sm space-y-1">
                        <li className="flex items-center gap-1">
                          <Zap size={12} className="text-yellow-400 flex-shrink-0" />
                          <span>Get 10 extra spins when you top up</span>
                        </li>
                        <li className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-yellow-400 flex-shrink-0" />
                          <span>Lift your winnings to KSH 1,000 to withdraw</span>
                        </li>
                        <li className="flex items-center gap-1">
                          <Sparkles size={12} className="text-yellow-400 flex-shrink-0" />
                          <span>Instant M-Pesa withdrawals available</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile-optimized footer info */}
            <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-slate-600/30">
              <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm">
                <Clock size={14} className="text-emerald-400 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-center w-full sm:text-left">Instant • No fees • Secure M-Pesa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stunning Top-Up Modal */}
      <TopUpModal 
        isOpen={showTopUpModal} 
        onClose={() => setShowTopUpModal(false)} 
      />
    </div>
  );
};

export default WithdrawalModal;
