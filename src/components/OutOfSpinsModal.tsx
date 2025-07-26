import React from 'react';
import { Wallet, X } from 'lucide-react';

interface OutOfSpinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: () => void;
}

const OutOfSpinsModal: React.FC<OutOfSpinsModalProps> = ({ isOpen, onClose, onDeposit }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm p-6 mx-4 bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-purple-500/30 rounded-2xl shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-4 mb-4 bg-purple-500/10 border border-purple-500/20 rounded-full animate-pulse">
            <Wallet size={40} className="text-purple-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Out of Free Spins!</h2>
          <p className="text-gray-300 mb-6">
            Your free ride is over, but the fun doesn't have to stop. Deposit now to keep the wins coming!
          </p>

          <button
            onClick={onDeposit}
            className="w-full px-6 py-3 font-bold text-white transition-all duration-300 transform bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-lg hover:scale-105 active:scale-95 shadow-lg"
          >
            Deposit to Keep Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutOfSpinsModal;
