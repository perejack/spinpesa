import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Zap, 
  Star, 
  CheckCircle, 
  Loader2,
  ArrowRight,
  Gift,
  TrendingUp,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { soundManager } from '../utils/soundUtils';
import { initiateStkPush } from '../utils/paymentApi';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useGame();
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [phoneNumber, setPhoneNumber] = useState(state.phoneNumber || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [animateCoins, setAnimateCoins] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [spinBalance, setSpinBalance] = useState<number|null>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const topUpAmounts = [
    { amount: 10, bonus: 0, popular: false },
    { amount: 50, bonus: 10, popular: true },
    { amount: 100, bonus: 25, popular: false },
    { amount: 200, bonus: 75, popular: false },
    { amount: 1000, bonus: 200, popular: false },
  ];

  useEffect(() => {
    if (isOpen) {
      setAnimateCoins(true);
      soundManager.play('click');
    }
  }, [isOpen]);

  useEffect(() => {
    async function fetchSpins() {
      if (phoneNumber && phoneNumber.length >= 10) {
        const { getSpinBalance } = await import('../utils/supabaseClient');
        const spins = await getSpinBalance(phoneNumber);
        setSpinBalance(spins);
      } else {
        setSpinBalance(null);
      }
    }
    fetchSpins();
  }, [phoneNumber, isOpen]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    soundManager.play('click');
    
    // Show phone input with smooth animation
    if (!showPhoneInput) {
      setShowPhoneInput(true);
      // Focus on input after animation completes
      setTimeout(() => {
        phoneInputRef.current?.focus();
        phoneInputRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  };

  const handleTopUp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    soundManager.play('click');
    setIsProcessing(true);
    setShowSuccess(false);
    let errorMsg = '';
    try {
      const { formatPhone } = await import('../utils/phoneFormat');
      const formattedPhone = formatPhone(phoneNumber);
      // Use the selected amount (without bonus) for payment
      const response = await initiateStkPush(formattedPhone, selectedAmount);
      if (response.success) {
        setShowSuccess(true);
        soundManager.play('cash');
        // Update phone number and refresh spin balance
        dispatch({ type: 'SET_PHONE_NUMBER', payload: formattedPhone });
        // Refresh spin balance from Supabase
        const { getSpinBalance } = await import('../utils/supabaseClient');
        const updatedBalance = await getSpinBalance(formattedPhone);
        dispatch({ type: 'ADD_PAID_SPINS', payload: updatedBalance });
      } else {
        errorMsg = response.message || 'Failed to initiate payment.';
      }
    } catch (err) {
      errorMsg = 'Network error. Please try again.';
    }
    setIsProcessing(false);
    if (errorMsg) {
      alert(errorMsg); // You can replace with a better UI feedback
    } else {
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in px-3 py-4 sm:px-6 sm:py-6">
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto animate-slide-up">
        {/* Mobile-first optimization */}
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Mobile-optimized main modal container */}
        <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-purple-100/20 overflow-hidden max-h-[92vh] overflow-y-auto">
          {/* Mobile scroll indicator */}
          <div className="sticky top-0 w-full h-1 bg-gradient-to-r from-purple-100/20 via-purple-100/40 to-purple-100/20 z-10"></div>
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-purple-100/20 rounded-3xl blur-xl animate-pulse"></div>
          
          {/* Enhanced mobile close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-12 h-12 sm:w-10 sm:h-10 bg-slate-700/80 hover:bg-slate-600/80 active:bg-slate-100/80 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            <X size={22} className="text-white sm:w-5 sm:h-5" />
          </button>

          {/* Success overlay */}
          {showSuccess && (
            <div className="absolute inset-0 bg-purple-600/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-3xl">
              <div className="text-center text-white animate-bounce">
                <CheckCircle size={64} className="mx-auto mb-4 text-purple-200" />
                <h3 className="text-2xl font-black mb-2">Top-Up Successful!</h3>
                <p className="text-purple-100">KSH {selectedAmount + (topUpAmounts.find(opt => opt.amount === selectedAmount)?.bonus || 0)} added to your balance</p>
              </div>
            </div>
          )}

          <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6 pb-6 sm:pb-8">
            {/* Mobile-optimized header with animated credit card */}
            <div className="text-center space-y-3 sm:space-y-4 pt-2">
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <CreditCard size={28} className="text-white sm:w-8 sm:h-8" />
                {animateCoins && (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-bounce">
                    <span className="text-xs">💳</span>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2">Top Up Balance</h2>
                <p className="text-slate-300 text-sm sm:text-base">Add funds to continue spinning</p>
              </div>
            </div>

            {/* Mobile-optimized current balance display */}
            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-100/30 hover-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-300 text-xs sm:text-sm">Current Balance</p>
                    <p className="text-xl sm:text-2xl font-black text-white">KSH {state.balance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-purple-400 text-xs sm:text-sm">
                    <Star size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Available</span>
                    <span className="sm:hidden">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-optimized top-up amount selection */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
                <Zap size={16} className="text-purple-400 sm:w-[18px] sm:h-[18px]" />
                Select Top-Up Amount
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {topUpAmounts.map((option) => (
                  <button
                    key={option.amount}
                    onClick={() => handleAmountSelect(option.amount)}
                    className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 touch-manipulation ${
                      selectedAmount === option.amount
                        ? 'border-purple-100 bg-purple-100/20 shadow-lg shadow-purple-100/25 scale-[1.02]'
                        : 'border-slate-600 bg-slate-700/30 hover:border-purple-400 hover:bg-purple-100/10 active:scale-95'
                    }`}
                    style={{ touchAction: 'manipulation', minHeight: '60px' }}
                  >
                    {option.popular && (
                      <div className="absolute -top-1 left-2 sm:-top-2 sm:left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-black px-2 py-1 rounded-full animate-pulse">
                        POPULAR
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-white font-bold text-base sm:text-lg">KSH {option.amount}</p>
                        {option.bonus > 0 && (
                          <p className="text-purple-300 text-xs sm:text-sm flex items-center gap-1">
                            <Gift size={12} className="sm:w-[14px] sm:h-[14px]" />
                            +{option.bonus} bonus
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-black text-lg sm:text-xl">
                          KSH {option.amount + option.bonus}
                        </p>
                        {option.bonus > 0 && (
                          <p className="text-emerald-400 text-xs sm:text-sm font-bold">
                            {Math.round((option.bonus / option.amount) * 100)}% bonus!
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stylish animated phone input reveal */}
            {showPhoneInput && (
              <div className="space-y-2 sm:space-y-3 animate-slide-up">
                {/* Animated separator with glow effect */}
                <div className="relative my-4 sm:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gradient-to-r from-transparent via-purple-100/10 to-transparent animate-pulse"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full animate-glow">
                      <span className="text-white text-xs font-bold flex items-center gap-1">
                        <Sparkles size={12} className="animate-spin" />
                        Enter Details
                        <Sparkles size={12} className="animate-spin" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enhanced phone input with floating label effect */}
                <div className="relative transform transition-all duration-100 animate-fade-in">
                  <label className="text-white font-bold flex items-center gap-2 text-sm sm:text-base mb-2 animate-slide-up">
                    <div className="w-6 h-6 bg-purple-100/20 rounded-lg flex items-center justify-center animate-pulse">
                      <Smartphone size={14} className="text-purple-400" />
                    </div>
                    M-Pesa Phone Number
                    <div className="ml-auto flex items-center gap-1 text-xs text-purple-300">
                      <Shield size={12} />
                      <span>Secure</span>
                    </div>
                  </label>
                  
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg sm:rounded-xl blur opacity-30 group-hover:opacity-10 transition duration-300 animate-pulse"></div>
                    <div className="relative">
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isProcessing}
                        className={`w-full font-black py-4 sm:py-5 rounded-lg sm:rounded-xl transition-all duration-200 transform relative overflow-hidden text-base sm:text-lg touch-manipulation ${
                          phoneNumber && phoneNumber.length >= 10 && !isProcessing
                            ? 'bg-gradient-to-r from-purple-600 via-purple-100 to-purple-600 hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 text-white active:scale-95 shadow-xl hover:shadow-2xl'
                            : 'bg-slate-600/10 text-slate-400 cursor-not-allowed'
                        }`}
                        style={{ touchAction: 'manipulation', minHeight: '56px' }}
                        maxLength={10}
                        minLength={10}
                        pattern="[0-9]{10}"
                        placeholder="07xxxxxxxx"
                      />
                      {phoneNumber && phoneNumber.length >= 10 && !isProcessing && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <button
                    className={`w-full mt-4 py-4 rounded-lg font-black text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                      phoneNumber && phoneNumber.length >= 10 && !isProcessing
                        ? 'bg-gradient-to-r from-purple-600 via-purple-100 to-purple-600 text-white hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 active:scale-95 shadow-xl hover:shadow-2xl'
                        : 'bg-slate-600/10 text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={!phoneNumber || phoneNumber.length < 10 || isProcessing}
                    style={{ touchAction: 'manipulation', minHeight: '56px' }}
                    onClick={handleTopUp}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : phoneNumber && phoneNumber.length >= 10 ? (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay KSH {selectedAmount} via M-Pesa
                        <ArrowRight className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-5 h-5" />
                        Enter Valid Phone Number
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile-optimized footer info */}
            <div className="bg-slate-800/10 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-slate-600/30">
              <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm">
                <Shield size={14} className="text-purple-400 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-center w-full sm:text-left">Secure • Instant • No fees</span>
              </div>
            </div>

            {/* Mobile-optimized bonus info */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-yellow-100/30">
              <div className="flex items-center gap-2 text-yellow-200 text-xs sm:text-sm">
                <Sparkles size={14} className="text-yellow-400 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="text-center w-full sm:text-left">Bonus credits on larger top-ups!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpModal;
