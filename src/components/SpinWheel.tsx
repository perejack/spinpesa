import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import SpeedometerOverlay from './SpeedometerOverlay';
import { Star, Gift, Trophy, Award, Zap } from 'lucide-react';
import FreeSpinsModal from './FreeSpinsModal';
import LoseModal from './LoseModal';
import FreeSpinsIndicator from './FreeSpinsIndicator';
import OutOfSpinsModal from './OutOfSpinsModal';
import { soundManager } from '../utils/soundUtils';

const MAX_SPIN_POWER = 2000; // ms, 2 seconds for max power
const MIN_SPIN_SPEED = 4; // seconds
const MAX_SPIN_SPEED = 1.1; // seconds (fastest)

const wheelSize = 260;
const SpinWheel = () => {
  const { state, dispatch, canSpin, getControlledWin } = useGame();
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFreeSpinsModal, setShowFreeSpinsModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [showOutOfSpinsModal, setShowOutOfSpinsModal] = useState(false);

  // Automatically prompt to deposit when user has no spins and insufficient funds
  React.useEffect(() => {
    if (!isAnimating && state.freeSpins === 0 && state.balance < 10) {
      setShowOutOfSpinsModal(true);
    }
  }, [isAnimating, state.freeSpins, state.balance]);

  // Long-press spin logic
  const [spinPower, setSpinPower] = useState(0); // ms
  const [spinPowerStart, setSpinPowerStart] = useState<number|null>(null);
  const spinPowerTimer = React.useRef<NodeJS.Timeout|null>(null);
  // For animated counter
  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  // For WOW visual
  const showWow = spinPower >= MAX_SPIN_POWER - 50;


  function handleSpinPressStart(e: React.MouseEvent | React.TouchEvent) {
    if (isAnimating) return;
    if (!canSpin()) {
      // Prevent event propagation and show modal
      e.preventDefault();
      e.stopPropagation();
      setShowOutOfSpinsModal(true);
      soundManager.play('click');
      return;
    }
    // Only allow long-press logic if spinning is allowed
    soundManager.play('click');
    setSpinPower(0);
    setSpinPowerStart(Date.now());
    if (spinPowerTimer.current) clearInterval(spinPowerTimer.current);
    spinPowerTimer.current = setInterval(() => {
      setSpinPower((prev) => {
        const newPower = Math.min((Date.now() - (spinPowerStart ?? Date.now())), MAX_SPIN_POWER);
        return newPower;
      });
    }, 16);
    // Animate speed counter up
    let last = 0;
    function animateSpeed() {
      if (!spinPowerStart) return;
      const held = Math.min(Date.now() - spinPowerStart, MAX_SPIN_POWER);
      const target = Math.round(100 * held / MAX_SPIN_POWER);
      setAnimatedSpeed((cur) => {
        if (Math.abs(cur - target) < 2) return target;
        return cur + (target > cur ? 2 : -2);
      });
      last = target;
      if (spinPowerStart) requestAnimationFrame(animateSpeed);
    }
    animateSpeed();
  }
  function handleSpinPressEnd(e: React.MouseEvent | React.TouchEvent) {
    // If user can't spin, don't process the end event to avoid interfering with modal
    if (!canSpin()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (isAnimating) return;
    if (spinPowerTimer.current) clearInterval(spinPowerTimer.current);
    const held = spinPowerStart ? Math.min(Date.now() - spinPowerStart, MAX_SPIN_POWER) : 0;
    setSpinPower(held);
    setSpinPowerStart(null);
    // Animate speed down
    setTimeout(() => setAnimatedSpeed(0), 500);
    // Sound FX: play whoosh or wow
    if (held >= MAX_SPIN_POWER - 50) {
      // soundManager.play('wow');
      if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    } else {
      // soundManager.play('whoosh');
      if (navigator.vibrate) navigator.vibrate(20);
    }
    spinWheel(held);
    setTimeout(() => setSpinPower(0), 300);
  }
  function handleSpinPressCancel() {
    // Only clear timers if user can actually spin
    if (canSpin()) {
      if (spinPowerTimer.current) clearInterval(spinPowerTimer.current);
      setSpinPower(0);
      setSpinPowerStart(null);
    }
  }

  // Updated segments: 12 segments, max win 150, equal win/lose chance
  // Prizes: 0 (lose), 10, 0 (lose), 150, 0 (lose), 25, 0 (lose), 100, 0 (lose), 75, 0 (lose), 50
  const segments = [
    { value: 20,  color: '#10B981', label: 'Cash 20',  icon: '💵', type: 'cash' },
    { value: 0,   color: '#EF4444', label: 'LOSE',     icon: '❌', type: 'lose' },
    { value: 50,  color: '#2563EB', label: 'Cash 50',  icon: '💵', type: 'cash' },
    { value: 0,   color: '#EF4444', label: 'LOSE',     icon: '❌', type: 'lose' },
    { value: 100, color: '#F59E0B', label: 'Cash 100', icon: '💵', type: 'cash' },
    { value: 0,   color: '#EF4444', label: 'LOSE',     icon: '❌', type: 'lose' },
    { value: 150, color: '#8B5CF6', label: 'Cash 150', icon: '💵', type: 'cash' },
    { value: 0,   color: '#EF4444', label: 'LOSE',     icon: '❌', type: 'lose' },
    { value: 200, color: '#d946ef', label: 'Cash 200', icon: '💵', type: 'cash' },
    { value: 0,   color: '#EF4444', label: 'LOSE',     icon: '❌', type: 'lose' },
    { value: 300, color: '#a21caf', label: 'JACKPOT 300', icon: '💎', type: 'cash' },
    { value: 0,   color: '#EF4444', label: 'LOSE',     icon: '❌', type: 'lose' },
  ];

  const spinWheel = async (powerOverride?: number) => {
    if (!canSpin() || isAnimating) return;
    let phoneNumber = state.phoneNumber;
    // Always use formatted phone for backend
    const { formatPhone } = await import('../utils/phoneFormat');
    phoneNumber = formatPhone(phoneNumber);

    // Check actual Supabase balance for paid spins
    let supabaseSpinBalance = 0;
    if (state.freeSpins === 0 && phoneNumber && phoneNumber.length >= 10) {
      try {
        const { getSpinBalance } = await import('../utils/supabaseClient');
        supabaseSpinBalance = await getSpinBalance(phoneNumber);
      } catch (error) {
        console.error('Failed to fetch spin balance:', error);
      }
    }

    // If user has no free spins and no Supabase balance, show deposit message
    if (state.freeSpins === 0 && supabaseSpinBalance <= 0) {
      setShowOutOfSpinsModal(true);
      soundManager.play('click');
      return;
    }

    // Supabase paid spin deduction
    let paidSpinAllowed = true;
    if (state.freeSpins === 0 && phoneNumber && phoneNumber.length >= 10) {
      const { useSpin } = await import('../utils/supabaseClient');
      paidSpinAllowed = await useSpin(phoneNumber);
      if (!paidSpinAllowed) {
        setShowOutOfSpinsModal(true);
        setIsAnimating(false);
        soundManager.play('click');
        return;
      }
    }

    setIsAnimating(true);
    setShowCelebration(false);
    setShowLoseModal(false);
    dispatch({ type: 'SPIN_START' });

    // Calculate spin speed based on power
    let spinDuration = MIN_SPIN_SPEED;
    if (typeof powerOverride === 'number') {
      const pct = Math.min(powerOverride, MAX_SPIN_POWER) / MAX_SPIN_POWER;
      spinDuration = MIN_SPIN_SPEED - (MIN_SPIN_SPEED - MAX_SPIN_SPEED) * pct;
    }

    const isFreeSpin = state.freeSpins > 0;
    if (isFreeSpin) {
      dispatch({ type: 'USE_FREE_SPIN' });
    } else {
      dispatch({ type: 'SUBTRACT_BALANCE', payload: 10 });
    }

    // 1. DETERMINE THE WIN AMOUNT FIRST
    let winAmount = 0;
    if (isFreeSpin) {
      // Spins left AFTER this spin is completed
      const spinsLeftAfterThis = Math.max(0, state.remainingFreeSpins - 1);
      const remainingTarget = state.targetWinnings - state.totalWinnings;

      if (spinsLeftAfterThis === 0) {
        // Last spin must close the gap exactly
        winAmount = Math.max(0, remainingTarget);
      } else {
        // Determine how many wins are still required to reach the minimum 4 wins rule
        const winsNeeded = Math.max(4 - state.freeWinCount, 0);
        const winsNeededAfterThis = Math.max(0, winsNeeded - 1); // if we decide to win now
        const minCashPrize = Math.min(...segments.filter(s => s.type === 'cash').map(s => s.value));

        // Decide if this spin must be a win to keep constraints achievable
        const mustWin = spinsLeftAfterThis < winsNeeded || (remainingTarget - minCashPrize * winsNeededAfterThis) < 0;

        const lossChance = mustWin ? 0 : 0.7;
        const isLoss = Math.random() < lossChance;
        if (isLoss) {
          winAmount = 0;
        } else {
          // Calculate an average needed per remaining win spin (including this one)
          const winsRemainingIncludingThis = winsNeededAfterThis + 1;
          const averageWin = remainingTarget / winsRemainingIncludingThis;
          const variation = Math.random() * 0.8 + 0.6; // 60% - 140%
          let potentialWin = Math.round(averageWin * variation);
          // Snap to closest available cash prize on the wheel
          const cashPrizes = segments.filter(s => s.type === 'cash').map(s => s.value);
          winAmount = cashPrizes.reduce((prev, curr) =>
            Math.abs(curr - potentialWin) < Math.abs(prev - potentialWin) ? curr : prev
          );
          // Clamp so that we don't overshoot remainingTarget
          if (winAmount > remainingTarget) {
            winAmount = cashPrizes.filter(v => v <= remainingTarget).pop() || remainingTarget;
          }
        }
      }
    } else {
      // Paid spin: randomly select a segment
      const randomIndex = Math.floor(Math.random() * segments.length);
      winAmount = segments[randomIndex].value;
    }

    // 2. FIND A TARGET SEGMENT THAT MATCHES THE WIN AMOUNT
    let possibleSegments = segments
      .map((seg, i) => ({ ...seg, index: i }))
      .filter(seg => seg.value === winAmount);

    // Fallback: if no matching segment, default to a lose segment (value 0)
    if (possibleSegments.length === 0) {
      winAmount = 0;
      possibleSegments = segments
        .map((seg, i) => ({ ...seg, index: i }))
        .filter(seg => seg.value === 0);
    }

    const targetSegment = possibleSegments[Math.floor(Math.random() * possibleSegments.length)];

    // 3. CALCULATE THE EXACT ROTATION TO LAND ON THE TARGET SEGMENT
    const segmentAngle = 360 / segments.length;
    const segmentCenter = (targetSegment.index * segmentAngle) + (segmentAngle / 2);
    const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
    // Pointer points downward (South) which is 90° in SVG coordinate space
    const pointerAngle = 90;
    const desiredFinalMod = (pointerAngle - (segmentCenter + randomOffset) + 360) % 360;

    const currentAngle = ((rotation % 360) + 360) % 360;
    const angleDelta = (desiredFinalMod - currentAngle + 360) % 360;
    const extraSpins = Math.floor(Math.random() * 3) + 4; // 4-6 full spins
    // Apply absolute rotation so we end exactly on the target with a single animation
    const finalRotation = rotation + 360 * extraSpins + angleDelta;
    setRotation(finalRotation);
    soundManager.play('spin');
    await new Promise((resolve) => setTimeout(resolve, spinDuration * 1000));
    // Add a burst or glow effect if spun at max power
    if (typeof powerOverride === 'number' && powerOverride >= MAX_SPIN_POWER - 50) {
      // Add a one-time burst effect (handled in CSS or a state)
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 600);
    }

    // This is the state before the spin started, so check if it was 1.
    const wasLastFreeSpin = isFreeSpin && state.freeSpins === 1;

    setTimeout(() => {
      setIsAnimating(false);

      if (winAmount > 0) {
        setShowCelebration(true);
        soundManager.play('win');
        setTimeout(() => setShowCelebration(false), 4000);
      } else {
        soundManager.play('lose');
        setShowLoseModal(true);
        setTimeout(() => setShowLoseModal(false), 3000);
      }

      dispatch({ type: 'SPIN_END', payload: { win: winAmount, isWin: winAmount > 0 } });

      if (winAmount > 0) {
        dispatch({
          type: 'ADD_TRANSACTION',
          payload: {
            id: Date.now().toString(),
            type: 'win',
            amount: winAmount,
            timestamp: new Date(),
            status: 'completed',
          },
        });
      }
    }, 800);
  };

  const getPrizeDescription = (segment: typeof segments[0]) => {
    switch (segment.type) {
      case 'cash': return `KSH ${segment.value} Cash`;
      case 'airtime': return `KSH ${segment.value} Airtime`;
      case 'data': return `KSH ${segment.value} Data Bundle`;
      case 'voucher': return `KSH ${segment.value} Shopping Voucher`;
      case 'gift': return `KSH ${segment.value} Gift Card`;
      case 'jackpot': return `KSH ${segment.value} JACKPOT!`;
      case 'premium': return `KSH ${segment.value} Premium Prize`;
      default: return 'Better luck next time!';
    }
  };

  const handleDepositFromModal = () => {
    setShowFreeSpinsModal(false);
    dispatch({ type: 'TOGGLE_PAYMENT_MODAL' });
    soundManager.play('click');
  };

  const handleDepositFromOutOfSpinsModal = () => {
    setShowOutOfSpinsModal(false);
    dispatch({ type: 'TOGGLE_PAYMENT_MODAL' });
    soundManager.play('click');
  };

  return (
    <div className="flex flex-col items-center relative w-full max-w-sm mx-auto">
      <FreeSpinsModal
        isOpen={showFreeSpinsModal}
        onClose={() => {
          setShowFreeSpinsModal(false);
          soundManager.play('click');
        }}
        onDeposit={handleDepositFromModal}
      />

      <OutOfSpinsModal
        isOpen={showOutOfSpinsModal}
        onClose={() => setShowOutOfSpinsModal(false)}
        onDeposit={handleDepositFromOutOfSpinsModal}
      />

      <LoseModal
        isOpen={showLoseModal}
        onClose={() => {
          setShowLoseModal(false);
          soundManager.play('click');
          if (state.freeSpins === 0 && state.balance < 10) {
            setShowOutOfSpinsModal(true);
          }
        }}
      />

      {/* Enhanced Mobile Celebration */}
      {showCelebration && state.lastWin > 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 sm:w-3 sm:h-3 animate-bounce ${
                  i % 4 === 0 ? 'bg-yellow-400' : 
                  i % 4 === 1 ? 'bg-green-400' : 
                  i % 4 === 2 ? 'bg-blue-400' : 'bg-red-400'
                } rounded-full`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 rounded-3xl animate-pulse shadow-2xl">
              <div className="bg-white rounded-3xl p-6 sm:p-8 text-center max-w-xs sm:max-w-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 to-orange-100 opacity-50 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="text-5xl sm:text-6xl md:text-8xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-gray-800 mb-2 animate-pulse">WINNER!</h2>
                  <p className="text-sm sm:text-lg md:text-xl text-gray-600 mb-4">You won:</p>
                  <div className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-6 animate-bounce">
                    {getPrizeDescription(segments.find(s => s.value === state.lastWin) || segments[0])}
                  </div>
                  <div className="flex justify-center space-x-2 sm:space-x-4">
                    <Star className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-500 animate-spin" />
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-500 animate-bounce" />
                    <Gift className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-500 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-Optimized Wheel Container */}
      <div className="relative mb-6 sm:mb-8">
        <div className="absolute inset-0 w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-20 animate-pulse blur-2xl"></div>
        
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96">
          {/* Enhanced Mobile Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-30">
            <div className="relative">
              <div className="absolute inset-0 w-10 h-12 sm:w-12 sm:h-16 bg-yellow-400 rounded-t-full blur-lg opacity-80 animate-pulse"></div>
              
              <div className="relative w-10 h-12 sm:w-12 sm:h-16 bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 rounded-t-full border-2 sm:border-4 border-white shadow-2xl transform hover:scale-110 transition-transform duration-200">
                <div className="absolute top-1 sm:top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-inner"></div>
                <div className="absolute top-4 sm:top-6 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
              </div>
              
              <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-600 to-gray-900 rounded-full border-2 sm:border-4 border-white shadow-2xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Mobile-Optimized Wheel */}
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 p-2 sm:p-3 shadow-2xl">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-white p-1 sm:p-2 shadow-inner">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-white to-gray-100 p-1">
                  <svg
                    className="w-full h-full transform transition-transform ease-out rounded-full shadow-2xl"
                    style={{ 
                      transform: `rotate(${rotation}deg)`,
                      transitionDuration: isAnimating ? '6000ms' : '0ms',
                      transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.320, 1)',
                      filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                    }}
                    viewBox="0 0 200 200"
                  >
                    {segments.map((segment, index) => {
                      const angle = (360 / segments.length) * index;
                      const nextAngle = (360 / segments.length) * (index + 1);
                      
                      const x1 = 100 + 95 * Math.cos((angle * Math.PI) / 180);
                      const y1 = 100 + 95 * Math.sin((angle * Math.PI) / 180);
                      const x2 = 100 + 95 * Math.cos((nextAngle * Math.PI) / 180);
                      const y2 = 100 + 95 * Math.sin((nextAngle * Math.PI) / 180);

                      const textAngle = angle + (360 / segments.length) / 2;
                      
                      const iconRadius = 78;
                      const textRadius = 55;
                      
                      const iconX = 100 + iconRadius * Math.cos((textAngle * Math.PI) / 180);
                      const iconY = 100 + iconRadius * Math.sin((textAngle * Math.PI) / 180);
                      const textX = 100 + textRadius * Math.cos((textAngle * Math.PI) / 180);
                      const textY = 100 + textRadius * Math.sin((textAngle * Math.PI) / 180);

                      return (
                        <g key={index}>
                          <defs>
                            <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={segment.color} stopOpacity="1" />
                              <stop offset="50%" stopColor={segment.color} stopOpacity="0.9" />
                              <stop offset="100%" stopColor={segment.color} stopOpacity="0.7" />
                            </linearGradient>
                            <filter id={`shadow-${index}`}>
                              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                            </filter>
                          </defs>
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                            fill={`url(#grad-${index})`}
                            stroke="#fff"
                            strokeWidth="3"
                            filter={`url(#shadow-${index})`}
                            className={`hover:brightness-110 transition-all duration-300${isAnimating && spinPower > MAX_SPIN_POWER * 0.7 ? ' wheel-trail-effect' : ''}`}
                          />
                          
                          <text
                            x={iconX}
                            y={iconY}
                            fill="white"
                            fontSize="16"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="font-bold"
                            style={{ 
                              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
                            }}
                          >
                            {segment.icon}
                          </text>
                          
                          <text
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize="6"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="uppercase tracking-wide"
                            style={{ 
                              filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.9))',
                              transform: `rotate(${textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle}deg)`,
                              transformOrigin: `${textX}px ${textY}px`
                            }}
                          >
                            {segment.label}
                          </text>
                        </g>
                      );
                    })}
                    
                    <defs>
                      <radialGradient id="centerGradient">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#d97706" />
                      </radialGradient>
                      <filter id="centerShadow">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodOpacity="0.4"/>
                      </filter>
                    </defs>
                    <circle
                      cx="100"
                      cy="100"
                      r="22"
                      fill="url(#centerGradient)"
                      stroke="#fff"
                      strokeWidth="5"
                      filter="url(#centerShadow)"
                      className="drop-shadow-2xl"
                    />
                    {/* Power Meter Animated Ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="20"
                      fill="none"
                      stroke={spinPower >= MAX_SPIN_POWER - 50 ? '#fbbf24' : 'url(#powerMeterGradient)'}
                      strokeWidth="5"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - spinPower / MAX_SPIN_POWER)}
                      style={{
                        filter: spinPower >= MAX_SPIN_POWER - 50 ? 'drop-shadow(0 0 16px #fbbf24)' : 'drop-shadow(0 0 8px #fbbf24cc)',
                        transition: 'stroke-dashoffset 0.15s linear, filter 0.2s',
                        opacity: spinPower > 0 ? 0.85 : 0.2,
                      }}
                    />
                    <defs>
                      <linearGradient id="powerMeterGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    {/* Burst/Confetti Effect */}
                    {showCelebration && (
                      <g>
                        {/* Enhanced fireworks burst at max power */}
                        {[...Array(24)].map((_, i) => {
                          const angle = (i / 24) * 2 * Math.PI;
                          const x1 = 100 + Math.cos(angle) * 12;
                          const y1 = 100 + Math.sin(angle) * 12;
                          const x2 = 100 + Math.cos(angle) * (showWow ? 38 : 28);
                          const y2 = 100 + Math.sin(angle) * (showWow ? 38 : 28);
                          return (
                            <line
                              key={i}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f472b6' : '#38bdf8'}
                              strokeWidth={showWow ? '5' : '3'}
                              strokeLinecap="round"
                              opacity={showWow ? 1 : 0.7}
                            />
                          );
                        })}
                        {[...Array(16)].map((_, i) => {
                          const angle = (i / 16) * 2 * Math.PI + Math.PI/8;
                          const cx = 100 + Math.cos(angle) * (showWow ? 32 : 24);
                          const cy = 100 + Math.sin(angle) * (showWow ? 32 : 24);
                          return (
                            <circle
                              key={i}
                              cx={cx}
                              cy={cy}
                              r={showWow ? "6" : "3.5"}
                              fill={i % 2 === 0 ? "#fbbf24" : "#38bdf8"}
                              opacity={showWow ? 0.9 : 0.65}
                            />
                          );
                        })}
                      </g>
                    )}
                    {/* Center Glow Orb & Icon */}
                    <circle
                      cx="100"
                      cy="100"
                      r="16"
                      fill="url(#centerGradient)"
                      filter="url(#centerShadow)"
                      className={spinPower >= MAX_SPIN_POWER - 50 ? 'animate-pulse ring-4 ring-yellow-400' : 'animate-pulse'}
                      style={{
                        filter: spinPower > 0 ? `drop-shadow(0 0 ${8 + 16 * (spinPower / MAX_SPIN_POWER)}px #fde68a)` : 'drop-shadow(0 0 8px #fbbf24cc)',
                        transition: 'filter 0.2s',
                      }}
                    />
                    <g transform="translate(100 100)">
                      <svg width="24" height="24" viewBox="0 0 24 24" style={{transform: 'translate(-12px, -12px)'}}>
                        <g>
                          <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.12"/>
                          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5"/>
                        </g>
                      </svg>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Spins Indicator */}
      {state.freeSpins > 0 && !isAnimating && (
        <FreeSpinsIndicator count={state.freeSpins} />
      )}

      {/* Enhanced Mobile Spin Button with Sound */}
      <button
        onMouseDown={handleSpinPressStart}
        onTouchStart={handleSpinPressStart}
        onMouseUp={handleSpinPressEnd}
        onMouseLeave={handleSpinPressCancel}
        onTouchEnd={handleSpinPressEnd}
        onTouchCancel={handleSpinPressCancel}
        disabled={isAnimating}
        className={`px-6 sm:px-8 py-4 sm:py-5 rounded-3xl font-black text-base sm:text-lg md:text-xl transition-all duration-300 transform relative overflow-hidden shadow-2xl w-full max-w-xs ${
           !isAnimating
             ? `bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white hover:scale-105 active:scale-95 animate-pulse ${showWow ? 'ring-4 ring-fuchsia-400 animate-shockwave' : ''}`
             : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
        }`}
        aria-label="Spin the wheel"
        tabIndex={0}
        style={{touchAction: 'manipulation'}}
      >
        {/* Power meter bar overlay */}
        {canSpin() && !isAnimating && spinPower > 0 && (
          <div className="absolute left-0 right-0 top-0 h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-t-3xl transition-all duration-75 z-20" style={{width: `${Math.round((spinPower / MAX_SPIN_POWER) * 100)}%`}} />
        )}
        {canSpin() && !isAnimating && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-orange-300/20 to-red-300/20 animate-ping"></div>
          </>
        )}
        
        <span className="relative z-10 text-base sm:text-lg md:text-xl text-center w-full">
          {/* Show speedometer and cues when holding, otherwise normal UI */}
          {spinPowerStart && !isAnimating ? (
            <span className="flex flex-col items-center justify-center gap-2 w-full">
              {/* Animated Speedometer */}
              <div className="relative mx-auto w-full max-w-xs aspect-square flex items-center justify-center select-none touch-none">
        {/* Responsive wheel for mobile */}
                {/* Speedometer Overlay */}
                {spinPowerStart && !isAnimating && (
                  <SpeedometerOverlay
                    power={spinPower / MAX_SPIN_POWER}
                    animatedValue={animatedSpeed}
                    showWow={showWow}
                  />
                )}
                <svg
                  width={wheelSize}
                  height={wheelSize}
                  viewBox="0 0 200 200"
                  className={`transition-all duration-500 ${isAnimating ? 'animate-spin-slow' : ''} ${showWow ? 'ring-4 ring-fuchsia-400 animate-pulse' : ''}`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {/* Wheel segments */}
                  {segments.map((segment, index) => {
                    const angle = (index / segments.length) * 2 * Math.PI;
                    const x1 = 100 + Math.cos(angle) * 95;
                    const y1 = 100 + Math.sin(angle) * 95;
                    const x2 = 100 + Math.cos(angle) * 105;
                    const y2 = 100 + Math.sin(angle) * 105;
                    const iconX = 100 + Math.cos(angle) * 80;
                    const iconY = 100 + Math.sin(angle) * 80;
                    const textX = 100 + Math.cos(angle) * 60;
                    const textY = 100 + Math.sin(angle) * 60;
                    const textAngle = angle * 180 / Math.PI;
                    return (
                      <g key={index}>
                        <defs>
                          <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={segment.color} stopOpacity="1" />
                            <stop offset="50%" stopColor={segment.color} stopOpacity="0.9" />
                            <stop offset="100%" stopColor={segment.color} stopOpacity="0.7" />
                          </linearGradient>
                          <filter id={`shadow-${index}`}>
                            <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                          </filter>
                        </defs>
                        <path
                          d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                          fill={`url(#grad-${index})`}
                          stroke="#fff"
                          strokeWidth="3"
                          filter={`url(#shadow-${index})`}
                          className={`hover:brightness-110 transition-all duration-300${isAnimating && spinPower > MAX_SPIN_POWER * 0.7 ? ' wheel-trail-effect' : ''}`}
                        />
                        
                        <text
                          x={iconX}
                          y={iconY}
                          fill="white"
                          fontSize="16"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-bold"
                          style={{ 
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'
                          }}
                        >
                          {segment.icon}
                        </text>
                        
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize="6"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="uppercase tracking-wide"
                          style={{ 
                            filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.9))',
                            transform: `rotate(${textAngle > 90 && textAngle < 270 ? textAngle + 180 : textAngle}deg)`,
                            transformOrigin: `${textX}px ${textY}px`
                          }}
                        >
                          {segment.label}
                        </text>
                      </g>
                    );
                  })}
                  <defs>
                    <radialGradient id="centerGradient">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </radialGradient>
                    <filter id="centerShadow">
                      <feDropShadow dx="0" dy="0" stdDeviation="5" floodOpacity="0.4"/>
                    </filter>
                  </defs>
                  <circle
                    cx="100"
                    cy="100"
                    r="22"
                    fill="url(#centerGradient)"
                    stroke="#fff"
                    strokeWidth="5"
                    filter="url(#centerShadow)"
                    className="drop-shadow-2xl"
                  />
                  {/* Power Meter Animated Ring */}
                  <circle
                    cx="100"
                    cy="100"
                    r="20"
                    fill="none"
                    stroke={spinPower >= MAX_SPIN_POWER - 50 ? '#fbbf24' : 'url(#powerMeterGradient)'}
                    strokeWidth="5"
                    strokeDasharray={Math.PI * 40}
                    strokeDashoffset={Math.PI * 40 * (1 - spinPower / MAX_SPIN_POWER)}
                    style={{
                      filter: spinPower >= MAX_SPIN_POWER - 50 ? 'drop-shadow(0 0 16px #fbbf24)' : 'drop-shadow(0 0 8px #fbbf24cc)',
                      transition: 'stroke-dashoffset 0.15s linear, filter 0.2s',
                      opacity: spinPower > 0 ? 0.85 : 0.2,
                    }}
                  />
                  <defs>
                    <linearGradient id="speedoGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="60%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  {/* Needle */}
                  <g style={{transition: 'transform 0.1s linear', transform: `rotate(${(-90 + 180 * (spinPower / MAX_SPIN_POWER))}deg)`, transformOrigin: '56px 56px'}}>
                    <rect x="54" y="16" width="4" height="36" rx="2" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
                    <circle cx="56" cy="56" r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                  </g>
                </svg>
                {/* Numeric speed value */}
                <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center text-yellow-400 text-2xl font-black drop-shadow-lg">
                  SPEED: {Math.round(100 * spinPower / MAX_SPIN_POWER)}
                </div>
              </div>
              {/* Wind lines animation */}
              <div className="flex items-center justify-center w-full relative h-4 mt-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${10 + i * 15}%`,
                      opacity: 0.2 + 0.7 * (spinPower / MAX_SPIN_POWER),
                      top: `${Math.random() * 8}px`,
                      filter: 'blur(1px)',
                      transition: 'opacity 0.1s',
                    }}
                  >
                    <svg width="32" height="8">
                      <rect x="0" y="2" width={18 + 12 * (spinPower / MAX_SPIN_POWER)} height="4" rx="2" fill="#fbbf24" fillOpacity="0.6" />
                    </svg>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-200 mt-2 animate-pulse">Hold longer for more speed!</span>
            </span>
          ) : isAnimating ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              SPINNING...
            </span>
          ) : state.freeSpins > 0 ? (
            <span className="flex items-center justify-center gap-3">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
              SPIN FREE!
            </span>
          ) : state.balance >= 10 ? (
            <span className="flex items-center justify-center gap-3">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              SPIN (10 KSH)
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              💳 Top Up to Spin
            </span>
          )}
        </span>
      </button>

      {/* Enhanced Mobile Recent Win Display */}
      {state.lastWin > 0 && !showCelebration && (
        <div className="mt-4 sm:mt-6 text-center animate-bounce w-full">
          <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-white/20 mx-4">
            <p className="text-base sm:text-xl md:text-2xl font-black flex items-center justify-center gap-2 sm:gap-3">
              <Award className="w-5 h-5 sm:w-8 sm:h-8 animate-spin" />
              <span className="text-center leading-tight">
                {getPrizeDescription(segments.find(s => s.value === state.lastWin) || segments[0])}
              </span>
              <Award className="w-5 h-5 sm:w-8 sm:h-8 animate-spin" />
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
