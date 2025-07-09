import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface GameState {
  balance: number;
  freeSpins: number;
  totalSpins: number;
  isSpinning: boolean;
  lastWin: number;
  withdrawalThreshold: number;
  transactions: Transaction[];
  showPaymentModal: boolean;
  phoneNumber: string;
  totalWinnings: number;
  targetWinnings: number;
  remainingFreeSpins: number;
  freeWinCount: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'win';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

type GameAction = 
  | { type: 'SPIN_START' }
  | { type: 'SPIN_END'; payload: { win: number; isWin: boolean } }
  | { type: 'ADD_BALANCE'; payload: number }
  | { type: 'SUBTRACT_BALANCE'; payload: number }
  | { type: 'SET_PHONE_NUMBER'; payload: string }
  | { type: 'TOGGLE_PAYMENT_MODAL' }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'USE_FREE_SPIN' }
  | { type: 'ADD_PAID_SPINS'; payload: number };

const initialState: GameState = {
  balance: 0,
  freeSpins: 10,
  totalSpins: 0,
  isSpinning: false,
  lastWin: 0,
  withdrawalThreshold: 1000, // Changed to 1000 KSH
  transactions: [],
  showPaymentModal: false,
  phoneNumber: '',
  totalWinnings: 0,
  targetWinnings: 950, // Target 950 KSH over 10 free spins
  remainingFreeSpins: 10,
  freeWinCount: 0,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'SPIN_START':
      return { ...state, isSpinning: true };
    case 'SPIN_END':
      const newTotalWinnings = state.totalWinnings + action.payload.win;
      return {
        ...state,
        isSpinning: false,
        balance: state.balance + action.payload.win,
        lastWin: action.payload.win,
        totalSpins: state.totalSpins + 1,
        totalWinnings: newTotalWinnings,
        freeWinCount: state.freeSpins > 0 && action.payload.win > 0 ? state.freeWinCount + 1 : state.freeWinCount,
      };
    case 'ADD_BALANCE':
      return { ...state, balance: state.balance + action.payload };
    case 'SUBTRACT_BALANCE':
      return { ...state, balance: Math.max(0, state.balance - action.payload) };
    case 'SET_PHONE_NUMBER':
      return { ...state, phoneNumber: action.payload };
    case 'TOGGLE_PAYMENT_MODAL':
      return { ...state, showPaymentModal: !state.showPaymentModal };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'USE_FREE_SPIN':
      return { 
        ...state, 
        freeSpins: Math.max(0, state.freeSpins - 1),
        remainingFreeSpins: Math.max(0, state.remainingFreeSpins - 1)
      };
    case 'ADD_PAID_SPINS':
      return { ...state, freeSpins: state.freeSpins + action.payload };
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  canSpin: () => boolean;
  getControlledWin: () => number;
} | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const canSpin = () => {
    // After the initial 10 free spins, user must deposit to get more spin credits.
    return !state.isSpinning && state.freeSpins > 0;
  };

  const getControlledWin = () => {
    // Only for free spins
    if (state.freeSpins > 0 && state.remainingFreeSpins > 0) {
      const remainingSpins = state.remainingFreeSpins;
      const remainingTarget = state.targetWinnings - state.totalWinnings;
      // The only allowed segment values (must match those in SpinWheel)
      const possibleWins = [10, 25, 50, 75, 100, 150];
      // Last spin: force total to 950, clamp to max segment value
      if (remainingSpins === 1) {
        // If not a valid segment, pick the highest possible <= remainingTarget
        const valid = possibleWins.filter(v => v <= remainingTarget);
        return valid.length > 0 ? Math.max(...valid) : 0;
      }
      // For other spins: randomly pick a value that doesn't make it impossible to reach 950
      // Find all possible values that allow a valid solution for the rest
      const minNeededForRest = (remainingSpins - 1) * Math.min(...possibleWins);
      const maxAllowedNow = remainingTarget - minNeededForRest;
      const valid = possibleWins.filter(v => v <= maxAllowedNow && v <= 150);
      if (valid.length === 0) return Math.min(...possibleWins);
      // Pick randomly from valid options
      return valid[Math.floor(Math.random() * valid.length)];
    }
    // For paid spins, always 0 (actual value comes from segment)
    return 0;
  };

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('spinGameState', JSON.stringify(state));
  }, [state]);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('spinGameState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      Object.keys(parsed).forEach(key => {
        if (key === 'balance') dispatch({ type: 'ADD_BALANCE', payload: parsed[key] });
        if (key === 'phoneNumber') dispatch({ type: 'SET_PHONE_NUMBER', payload: parsed[key] });
      });
    }
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch, canSpin, getControlledWin }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
