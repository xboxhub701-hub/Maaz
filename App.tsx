import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TimerCard from './components/TimerCard';
import StopwatchCard from './components/StopwatchCard';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import BillingModal from './components/BillingModal';
import HistoryView from './components/HistoryView';
import { TimerState, TimerStatus, StopwatchState, BillingRecord, GamePreset } from './types';

// A reusable confirmation modal component to replace window.confirm
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmButtonText = 'Confirm',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="confirmation-title" className="text-xl font-bold mb-4 text-center">{title}</h3>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
          {message}
        </p>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md text-white transition-colors shadow-md ${confirmButtonClass}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [timers, setTimers] = useState<TimerState[]>([]);
  const [stopwatches, setStopwatches] = useState<StopwatchState[]>([]);
  const [bankedEarnings, setBankedEarnings] = useState<number>(0);
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'timers' | 'stopwatches' | 'history'>('timers');
  const [costPerUnit, setCostPerUnit] = useState<number>(50);
  const [minutesPerUnit, setMinutesPerUnit] = useState<number>(10);
  const [gamePresets, setGamePresets] = useState<GamePreset[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isClearHistoryConfirmOpen, setIsClearHistoryConfirmOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    try {
      const savedTimers = localStorage.getItem('x-timers');
      if (savedTimers) {
          const parsedTimers: Omit<TimerState, 'costAnchor'>[] = JSON.parse(savedTimers);
          setTimers(parsedTimers.map(t => ({
              ...t,
              costAnchor: (t as TimerState).costAnchor ?? t.initialDuration
          })));
      }
      
      const savedStopwatches = localStorage.getItem('x-stopwatches');
      if (savedStopwatches) {
          const parsedStopwatches: Omit<StopwatchState, 'costAnchor'>[] = JSON.parse(savedStopwatches);
          setStopwatches(parsedStopwatches.map(s => ({
              ...s,
              costAnchor: (s as StopwatchState).costAnchor ?? 0
          })));
      }

      const savedEarnings = localStorage.getItem('x-timers-banked');
      if (savedEarnings) setBankedEarnings(JSON.parse(savedEarnings));
      
      const savedHistory = localStorage.getItem('x-timers-billing-history');
      if (savedHistory) setBillingHistory(JSON.parse(savedHistory));

      const savedCost = localStorage.getItem('x-timers-cost');
      if (savedCost) setCostPerUnit(JSON.parse(savedCost));

      const savedMinutes = localStorage.getItem('x-timers-minutes');
      if (savedMinutes) setMinutesPerUnit(JSON.parse(savedMinutes));
      
      const savedPresets = localStorage.getItem('x-timers-game-presets');
      if (savedPresets) setGamePresets(JSON.parse(savedPresets));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => { localStorage.setItem('x-timers', JSON.stringify(timers)); }, [timers]);
  useEffect(() => { localStorage.setItem('x-stopwatches', JSON.stringify(stopwatches)); }, [stopwatches]);
  useEffect(() => { localStorage.setItem('x-timers-banked', JSON.stringify(bankedEarnings)); }, [bankedEarnings]);
  useEffect(() => { localStorage.setItem('x-timers-billing-history', JSON.stringify(billingHistory)); }, [billingHistory]);
  useEffect(() => { localStorage.setItem('x-timers-cost', JSON.stringify(costPerUnit)); }, [costPerUnit]);
  useEffect(() => { localStorage.setItem('x-timers-minutes', JSON.stringify(minutesPerUnit)); }, [minutesPerUnit]);
  useEffect(() => { localStorage.setItem('x-timers-game-presets', JSON.stringify(gamePresets)); }, [gamePresets]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const addTimer = useCallback(() => {
    const newDuration = minutesPerUnit * 60;
    const newTimer: TimerState = {
      id: uuidv4(),
      name: `Station ${timers.length + 1}`,
      initialDuration: newDuration,
      remainingTime: newDuration,
      status: TimerStatus.STOPPED,
      costAnchor: newDuration,
    };
    setTimers(prev => [...prev, newTimer]);
  }, [timers.length, minutesPerUnit]);

  const updateTimer = useCallback((id: string, updates: Partial<TimerState>) => {
    setTimers(prev =>
      prev.map(timer => (timer.id === id ? { ...timer, ...updates } : timer))
    );
  }, []);

  const deleteTimer = useCallback((id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  }, []);

  const getPricing = useCallback((gamePresetId?: string): { cost: number; minutes: number } => {
    if (gamePresetId) {
        const preset = gamePresets.find(p => p.id === gamePresetId);
        if (preset) {
            return { cost: preset.costPerUnit, minutes: preset.minutesPerUnit };
        }
    }
    return { cost: costPerUnit, minutes: minutesPerUnit };
  }, [gamePresets, costPerUnit, minutesPerUnit]);

  const handleTimerReset = useCallback((id: string) => {
    const timerToReset = timers.find(t => t.id === id);
    if (!timerToReset) return;

    const { cost, minutes } = getPricing(timerToReset.gamePresetId);
    const elapsedTime = timerToReset.costAnchor - timerToReset.remainingTime;
    if (elapsedTime > 0) {
      const elapsedMinutes = elapsedTime / 60;
      const costFromSession = (elapsedMinutes / minutes) * cost;
      setBankedEarnings(prev => prev + costFromSession);
    }

    updateTimer(id, {
      status: TimerStatus.STOPPED,
      remainingTime: timerToReset.initialDuration,
      costAnchor: timerToReset.initialDuration,
    });
  }, [timers, updateTimer, getPricing]);
  
  const handleOpenBillingModal = () => {
    if (totalEarnings > 0.01) {
        setIsBillingModalOpen(true);
    } else {
        alert("Total earnings are zero. Nothing to bill.");
    }
  };

  const handleResetAndBill = () => {
    if (totalEarnings <= 0) {
        setIsBillingModalOpen(false);
        return;
    }

    const newRecord: BillingRecord = {
        id: uuidv4(),
        date: new Date().toISOString(),
        amount: totalEarnings,
    };
    setBillingHistory(prev => [newRecord, ...prev]);

    setBankedEarnings(0);
    setTimers(prevTimers =>
        prevTimers.map(timer => ({
            ...timer,
            costAnchor: timer.remainingTime,
        }))
    );
    setStopwatches(prevStopwatches =>
        prevStopwatches.map(sw => ({
            ...sw,
            costAnchor: sw.elapsedTime,
        }))
    );

    setIsBillingModalOpen(false);
  };

  const handleClearHistory = () => {
    setIsClearHistoryConfirmOpen(true);
  };

  const confirmClearHistory = () => {
    setBillingHistory([]);
    setIsClearHistoryConfirmOpen(false);
  };


  const addStopwatch = useCallback(() => {
    const newStopwatch: StopwatchState = {
      id: uuidv4(),
      name: `Stopwatch ${stopwatches.length + 1}`,
      elapsedTime: 0,
      laps: [],
      status: TimerStatus.STOPPED,
      costAnchor: 0,
    };
    setStopwatches(prev => [...prev, newStopwatch]);
  }, [stopwatches.length]);

  const updateStopwatch = useCallback((id: string, updates: Partial<StopwatchState>) => {
    setStopwatches(prev =>
      prev.map(sw => (sw.id === id ? { ...sw, ...updates } : sw))
    );
  }, []);

  const deleteStopwatch = useCallback((id: string) => {
    setStopwatches(prev => prev.filter(sw => sw.id !== id));
  }, []);

  const handleStopwatchReset = useCallback((id: string) => {
    const swToReset = stopwatches.find(sw => sw.id === id);
    if (!swToReset) return;
    
    const { cost, minutes } = getPricing(swToReset.gamePresetId);
    const costElapsedTime = swToReset.elapsedTime - swToReset.costAnchor;
    if (costElapsedTime > 0) {
      const elapsedMinutes = costElapsedTime / 60;
      const costFromSession = (elapsedMinutes / minutes) * cost;
      setBankedEarnings(prev => prev + costFromSession);
    }

    updateStopwatch(id, {
      status: TimerStatus.STOPPED,
      elapsedTime: 0,
      laps: [],
      costAnchor: 0,
    });
  }, [stopwatches, updateStopwatch, getPricing]);

  const totalEarnings = useMemo(() => {
    const currentTimersCost = timers.reduce((total, timer) => {
      const { cost, minutes } = getPricing(timer.gamePresetId);
      const elapsedTime = timer.costAnchor - timer.remainingTime;
      if (elapsedTime <= 0 || minutes === 0) return total;
      const elapsedMinutes = elapsedTime / 60;
      const sessionCost = (elapsedMinutes / minutes) * cost;
      return total + sessionCost;
    }, 0);

    const currentStopwatchesCost = stopwatches.reduce((total, sw) => {
      const { cost, minutes } = getPricing(sw.gamePresetId);
      const costElapsedTime = sw.elapsedTime - sw.costAnchor;
      if (costElapsedTime <= 0 || minutes === 0) return total;
      const elapsedMinutes = costElapsedTime / 60;
      const sessionCost = (elapsedMinutes / minutes) * cost;
      return total + sessionCost;
    }, 0);

    return bankedEarnings + currentTimersCost + currentStopwatchesCost;
  }, [timers, stopwatches, bankedEarnings, getPricing]);
  
  const handleSaveSettings = (newCost: number, newMinutes: number, newPresets: GamePreset[]) => {
    setCostPerUnit(newCost);
    setMinutesPerUnit(newMinutes);
    setGamePresets(newPresets);
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header 
        onAddTimer={addTimer} 
        onAddStopwatch={addStopwatch}
        totalEarnings={totalEarnings}
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetEarnings={handleOpenBillingModal}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'timers' && (
          <>
            {timers.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-slate-500 dark:text-slate-400">No timers yet.</h2>
                <p className="text-slate-400 dark:text-slate-500 mt-2">Click "Add Timer" to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {timers.map(timer => (
                  <TimerCard
                    key={timer.id}
                    timer={timer}
                    onUpdate={updateTimer}
                    onDelete={deleteTimer}
                    onReset={handleTimerReset}
                    costPerUnit={costPerUnit}
                    minutesPerUnit={minutesPerUnit}
                    gamePresets={gamePresets}
                  />
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === 'stopwatches' && (
           <>
            {stopwatches.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-semibold text-slate-500 dark:text-slate-400">No stopwatches yet.</h2>
                <p className="text-slate-400 dark:text-slate-500 mt-2">Click "Add Stopwatch" to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {stopwatches.map(sw => (
                  <StopwatchCard
                    key={sw.id}
                    stopwatch={sw}
                    onUpdate={updateStopwatch}
                    onDelete={deleteStopwatch}
                    onReset={handleStopwatchReset}
                    costPerUnit={costPerUnit}
                    minutesPerUnit={minutesPerUnit}
                    gamePresets={gamePresets}
                  />
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === 'history' && (
            <HistoryView history={billingHistory} onClearHistory={handleClearHistory} />
        )}
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        initialCost={costPerUnit}
        initialMinutes={minutesPerUnit}
        initialPresets={gamePresets}
      />
      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        onConfirm={handleResetAndBill}
        totalEarnings={totalEarnings}
      />
      <ConfirmationModal
        isOpen={isClearHistoryConfirmOpen}
        onClose={() => setIsClearHistoryConfirmOpen(false)}
        onConfirm={confirmClearHistory}
        title="Clear Billing History"
        message="Are you sure you want to delete all billing history? This action cannot be undone."
        confirmButtonText="Yes, Clear It"
      />
    </div>
  );
};

export default App;