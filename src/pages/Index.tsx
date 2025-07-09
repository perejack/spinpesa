
import React from 'react';
import SpinWheel from '../components/SpinWheel';
import MinimalHeader from '../components/MinimalHeader';
import GameStats from '../components/GameStats';
import PaymentModal from '../components/PaymentModal';
import HomeWithdrawal from '../components/HomeWithdrawal';
import { GameProvider } from '../context/GameContext';
import { Toaster } from '../components/ui/toaster';

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-x-hidden">
        {/* Enhanced Mobile Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-4 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
          <div className="absolute top-32 right-4 w-24 h-24 md:w-40 md:h-40 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-20 left-8 w-28 h-28 md:w-44 md:h-44 bg-gradient-to-r from-emerald-400 to-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 right-6 w-20 h-20 md:w-36 md:h-36 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-500"></div>
        </div>
        
        {/* Floating particles for mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Mobile-Optimized Header */}
          <div className="px-3 pt-6 pb-2">
            <MinimalHeader />
          </div>
          
          {/* Home Withdrawal - Prominent on mobile */}
          <div className="px-3 mb-4">
            <HomeWithdrawal />
          </div>
          
          {/* Mobile-First Content Layout */}
          <div className="flex-1 flex flex-col lg:flex-row lg:items-start lg:justify-center gap-4 lg:gap-6 px-3 pb-6">
            {/* Game Stats - Compact mobile card */}
            <div className="w-full lg:w-80 order-1">
              <GameStats />
            </div>
            
            {/* Spin Wheel - Center focus on mobile */}
            <div className="w-full lg:flex-1 flex justify-center items-center order-2 py-4">
              <SpinWheel />
            </div>
            
            {/* Payment Modal - Quick access on mobile */}
            <div className="w-full lg:w-80 order-3">
              <PaymentModal />
            </div>
          </div>
        </div>
        
        <Toaster />
      </div>
    </GameProvider>
  );
};

export default Index;
