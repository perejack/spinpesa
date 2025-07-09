import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { X, CreditCard, Smartphone, Plus } from 'lucide-react';
import { soundManager } from '../utils/soundUtils';

const PaymentModal = () => {
  const { state, dispatch } = useGame();
  const [phoneNumber, setPhoneNumber] = useState(state.phoneNumber);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!state.showPaymentModal) return null;

  const handleClose = () => {
    soundManager.play('click');
    dispatch({ type: 'TOGGLE_PAYMENT_MODAL' });
  };

  const handleDeposit = async (amount: number) => {
    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }

    soundManager.play('click');
    setIsProcessing(true);

    // Mock payment processing
    setTimeout(() => {
      soundManager.play('cash'); // Play cash sound on successful deposit
      
      dispatch({ type: 'ADD_BALANCE', payload: amount });
      dispatch({ type: 'SET_PHONE_NUMBER', payload: phoneNumber });
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: Date.now().toString(),
          type: 'deposit',
          amount: amount,
          timestamp: new Date(),
          status: 'completed'
        }
      });
      
      setIsProcessing(false);
      handleClose();
      alert(`Successfully deposited KSH ${amount}!`);
    }, 2000);
  };

  const handleSpinPurchase = async (cost: number, spins: number) => {
    if (!phoneNumber.trim()) {
      alert('Please enter your phone number');
      return;
    }

    soundManager.play('click');
    setIsProcessing(true);

    // Mock payment processing
    setTimeout(() => {
      soundManager.play('cash'); // Play cash sound on successful purchase
      
      dispatch({ type: 'ADD_PAID_SPINS', payload: spins });
      dispatch({ type: 'SET_PHONE_NUMBER', payload: phoneNumber });
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: Date.now().toString(),
          type: 'deposit',
          amount: cost,
          timestamp: new Date(),
          status: 'completed'
        }
      });
      
      setIsProcessing(false);
      handleClose();
      alert(`Successfully purchased ${spins} spins for KSH ${cost}!`);
    }, 2000);
  };

  const handleCustomDeposit = () => {
    const amount = parseInt(customAmount);
    if (amount && amount >= 50) {
      handleDeposit(amount);
    } else {
      alert('Minimum deposit is KSH 50');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-gradient-to-br from-slate-800/95 via-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl w-full max-w-md border border-slate-600/30 shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between p-5 border-b border-slate-600/30">
          <h2 className="text-xl font-bold text-white">Make a Deposit</h2>
          <button onClick={handleClose} className="hover:bg-slate-700/50 rounded-lg p-2 transition-colors duration-200">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Phone Input Section */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              Enter Phone Number
            </h3>
            <input
              type="tel"
              placeholder="Enter your M-Pesa phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full p-4 bg-slate-700/50 border border-slate-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Spin Packages Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Buy Spins
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => {
                  soundManager.play('click');
                  handleSpinPurchase(20, 5);
                }}
                disabled={isProcessing}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                5 Spins - KSH 20
              </button>
              
              <button
                onClick={() => {
                  soundManager.play('click');
                  handleSpinPurchase(50, 10);
                }}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                10 Spins - KSH 50
              </button>
            </div>
          </div>

          {/* Balance Top-up Section */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Top-up Balance
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[100, 200, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    soundManager.play('click');
                    handleDeposit(amount);
                  }}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  KSH {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Section with Sound */}
          <div className="space-y-4">
            <button
              onClick={() => {
                soundManager.play('click');
                setShowCustomInput(!showCustomInput);
              }}
              className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-slate-500/30"
            >
              <Plus className="w-4 h-4" />
              Enter Custom Amount
            </button>

            {showCustomInput && (
              <div className="space-y-3 animate-fade-in">
                <input
                  type="number"
                  placeholder="Enter amount (min 50)"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full p-4 bg-slate-700/50 border border-slate-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  min="50"
                />
                <button
                  onClick={() => {
                    soundManager.play('click');
                    handleCustomDeposit();
                  }}
                  disabled={isProcessing || !customAmount}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deposit KSH {customAmount || '0'}
                </button>
              </div>
            )}
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-emerald-400 font-semibold">Processing payment...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
