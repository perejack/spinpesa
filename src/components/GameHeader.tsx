import React from 'react';
import { useGame } from '../context/GameContext';
import { Coins, Gift, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '../utils/soundUtils';

const GameHeader = () => {
  const { state } = useGame();
  const [isMuted, setIsMuted] = React.useState(soundManager.isSoundMuted());

  const toggleSound = () => {
    soundManager.toggleMute();
    setIsMuted(soundManager.isSoundMuted());
    if (!soundManager.isSoundMuted()) {
      soundManager.play('click');
    }
  };

  return (
    <div className="relative">
      {/* Subtle glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 animate-pulse"></div>
      
      <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-600/30 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                <span className="text-2xl sm:text-3xl animate-bounce">🎰</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                  Lucky Spin
                </h1>
                <p className="text-slate-300 text-sm sm:text-base font-medium">
                  🎯 Win Big Prizes Daily!
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            {/* Sound Toggle Button */}
            <button
              onClick={toggleSound}
              className="w-12 h-12 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 border border-slate-500/30"
              title={isMuted ? 'Enable Sound' : 'Disable Sound'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-slate-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              )}
            </button>

            {/* Balance Display */}
            <div className="text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 drop-shadow-lg">
                  {state.balance.toLocaleString()}
                </span>
                <span className="text-emerald-300 font-semibold text-sm sm:text-base">KSH</span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">Current Balance</p>
            </div>

            {/* Free Spins Display */}
            {state.freeSpins > 0 && (
              <div className="text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-end gap-2 mb-1">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce" />
                  <span className="text-2xl sm:text-3xl font-black text-yellow-400 drop-shadow-lg animate-pulse">
                    {state.freeSpins}
                  </span>
                </div>
                <p className="text-yellow-300 text-xs sm:text-sm font-bold uppercase tracking-wide">
                  🎁 Free Spins
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
