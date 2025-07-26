import React from 'react';
import { Gift } from 'lucide-react';

interface FreeSpinsIndicatorProps {
  count: number;
}

const FreeSpinsIndicator: React.FC<FreeSpinsIndicatorProps> = ({ count }) => {
  // Key changes with count to re-trigger the animation
  const animationKey = `free-spin-count-${count}`;

  return (
    <div className="relative flex items-center justify-center gap-3 px-6 py-3 mb-4 overflow-hidden bg-black/30 border border-fuchsia-500/50 rounded-full shadow-lg backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/30 via-transparent to-purple-500/30 animate-pulse"></div>
      <Gift className="w-6 h-6 text-fuchsia-400 animate-pulse" />
      <div className="relative text-lg font-bold text-white">
        <span
          key={animationKey}
          className="inline-block animate-bounce-short"
        >
          {count}
        </span>
        <span className="ml-2 font-normal text-gray-300">Free Spins Left</span>
      </div>
    </div>
  );
};

export default FreeSpinsIndicator;
