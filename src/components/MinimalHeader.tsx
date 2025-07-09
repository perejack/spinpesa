import React from 'react';
import { useGame } from '../context/GameContext';

// You can replace this SVG with your actual logo or animated coin
const Logo = () => (
  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-lg">
    <span className="text-2xl animate-bounce">🪙</span>
  </div>
);

export default function MinimalHeader() {
  const { state } = useGame();
  return (
    <header className="w-full flex items-center justify-between px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md shadow-lg max-w-md mx-auto mt-2 mb-1 sticky top-0 z-50 border border-white/10">
      {/* Logo/coin */}
      <Logo />
      {/* (Optional) App name - remove if you want ultra-minimal */}
      {/* <span className="font-extrabold text-lg text-white tracking-widest drop-shadow-md">SpinWin</span> */}
      {/* Wallet balance */}
      <div className="flex items-center gap-2 px-3 py-1 bg-black/30 rounded-xl shadow-inner cursor-pointer select-none hover:bg-black/50 transition" tabIndex={0} aria-label="Wallet Balance">
        <span className="text-yellow-300 text-lg font-black drop-shadow-lg">{state.balance}</span>
        <span className="text-yellow-400 text-xl">🪙</span>
      </div>
    </header>
  );
}
