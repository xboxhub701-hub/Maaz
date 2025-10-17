import React, { useState, useEffect } from 'react';
import { PlusIcon, SunIcon, MoonIcon, SettingsIcon, RotateCcwIcon } from './icons';
import { CURRENCY_SYMBOL } from '../constants';

interface HeaderProps {
  onAddTimer: () => void;
  onAddStopwatch: () => void;
  totalEarnings: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: 'timers' | 'stopwatches' | 'history';
  setActiveTab: (tab: 'timers' | 'stopwatches' | 'history') => void;
  onOpenSettings: () => void;
  onResetEarnings: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onAddTimer, 
  onAddStopwatch, 
  totalEarnings, 
  theme, 
  toggleTheme, 
  activeTab, 
  setActiveTab,
  onOpenSettings,
  onResetEarnings
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const tabButtonClasses = (tabName: 'timers' | 'stopwatches' | 'history') => 
    `px-2 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
      activeTab === tabName
        ? 'bg-indigo-600 text-white'
        : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
    }`;

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4rem]">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              X Timer
            </h1>
            <div className="hidden sm:block text-sm font-mono bg-slate-200 dark:bg-slate-700 px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300">
              {formattedTime}
            </div>
            <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-lg flex space-x-1">
              <button onClick={() => setActiveTab('timers')} className={tabButtonClasses('timers')}>
                  Timers
              </button>
              <button onClick={() => setActiveTab('stopwatches')} className={tabButtonClasses('stopwatches')}>
                  Stopwatches
              </button>
               <button onClick={() => setActiveTab('history')} className={tabButtonClasses('history')}>
                  History
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="text-center hidden md:flex items-center gap-2">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Earnings</span>
                <p className="font-bold text-lg">{CURRENCY_SYMBOL}{totalEarnings.toFixed(2)}</p>
              </div>
               <button
                onClick={onResetEarnings}
                className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Reset total earnings"
              >
                <RotateCcwIcon />
              </button>
            </div>
             <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Open settings"
            >
              <SettingsIcon />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            {activeTab !== 'history' && (
               <button
                onClick={activeTab === 'timers' ? onAddTimer : onAddStopwatch}
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-2 sm:px-4 rounded-lg transition-colors shadow-md"
              >
                <PlusIcon />
                <span className="hidden sm:inline ml-1 sm:ml-2">
                  {activeTab === 'timers' ? 'Add Timer' : 'Add Stopwatch'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
