
import React from 'react';
import { RotateCcw, TrendingDown } from 'lucide-react';

interface LoseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoseModal: React.FC<LoseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 via-slate-900 to-gray-900 rounded-3xl p-6 border-2 border-red-500/30 w-full max-w-sm relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-16 h-16 bg-red-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-orange-500 rounded-full animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <TrendingDown className="w-12 h-12 text-red-400 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Better Luck Next Time!
          </h2>
          
          <p className="text-white/80 text-base mb-6 leading-relaxed">
            Don't give up! Every spin brings you closer to a big win. Keep spinning!
          </p>

          {/* Motivational message */}
          <div className="bg-white/10 rounded-xl p-3 mb-6 border border-white/20">
            <p className="text-yellow-400 font-semibold text-sm flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Winners never quit, quitters never win!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Try Again!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoseModal;
