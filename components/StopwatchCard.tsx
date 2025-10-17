import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StopwatchState, TimerStatus, GamePreset } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { PlayIcon, PauseIcon, ResetIcon, EditIcon, SaveIcon, DeleteIcon, FlagIcon } from './icons';

interface StopwatchCardProps {
  stopwatch: StopwatchState;
  onUpdate: (id: string, updates: Partial<StopwatchState>) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
  costPerUnit: number;
  minutesPerUnit: number;
  gamePresets: GamePreset[];
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

const StopwatchCard: React.FC<StopwatchCardProps> = ({ stopwatch, onUpdate, onDelete, onReset, costPerUnit, minutesPerUnit, gamePresets }) => {
  const { id, name, elapsedTime, status, laps, costAnchor, gamePresetId } = stopwatch;
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      intervalRef.current = window.setInterval(() => {
        onUpdate(id, { elapsedTime: stopwatch.elapsedTime + 1 });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, onUpdate, id, stopwatch.elapsedTime]);
  
  const handleStart = () => onUpdate(id, { status: TimerStatus.RUNNING });
  const handlePause = () => onUpdate(id, { status: TimerStatus.PAUSED });
  const handleReset = () => onReset(id);
  
  const handleNameSave = () => {
    if (tempName.trim()) {
      onUpdate(id, { name: tempName.trim() });
    }
    setIsEditingName(false);
  };
  
  const handleLap = () => {
    if (status === TimerStatus.RUNNING) {
      onUpdate(id, { laps: [...laps, elapsedTime] });
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPresetId = e.target.value;
    onUpdate(id, { gamePresetId: selectedPresetId ? selectedPresetId : undefined });
  };

  const cost = useMemo(() => {
    const activePreset = gamePresets.find(p => p.id === gamePresetId);
    const currentCostPerUnit = activePreset ? activePreset.costPerUnit : costPerUnit;
    const currentMinutesPerUnit = activePreset ? activePreset.minutesPerUnit : minutesPerUnit;
    
    const costElapsedTime = elapsedTime - costAnchor;
    if (costElapsedTime <= 0 || currentMinutesPerUnit === 0) return 0;

    const elapsedMinutes = costElapsedTime / 60;
    return (elapsedMinutes / currentMinutesPerUnit) * currentCostPerUnit;
  }, [elapsedTime, costAnchor, costPerUnit, minutesPerUnit, gamePresetId, gamePresets]);
  
  const cardColorClasses = {
    [TimerStatus.STOPPED]: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    [TimerStatus.RUNNING]: 'bg-sky-50 dark:bg-sky-900/50 border-sky-500',
    [TimerStatus.PAUSED]: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-500',
    [TimerStatus.FINISHED]: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700', // Not used, but for enum completeness
  };

  return (
    <div className={`rounded-xl shadow-lg p-5 border-2 transition-all duration-300 flex flex-col ${cardColorClasses[status]}`}>
      <div className="flex justify-between items-center mb-2">
        {isEditingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
            className="text-lg font-bold bg-transparent border-b-2 border-slate-400 focus:border-indigo-500 outline-none w-full mr-2"
            autoFocus
          />
        ) : (
          <h2 className="text-lg font-bold truncate" title={name}>{name}</h2>
        )}
        <div className="flex items-center space-x-2">
          <button onClick={() => isEditingName ? handleNameSave() : setIsEditingName(true)} className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors" aria-label={isEditingName ? 'Save name' : 'Edit name'}>
            {isEditingName ? <SaveIcon /> : <EditIcon />}
          </button>
          <button onClick={() => onDelete(id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Delete stopwatch">
            <DeleteIcon />
          </button>
        </div>
      </div>
      
      <div className="my-2 text-center">
          <p className="text-4xl sm:text-5xl font-fjalla tracking-tighter">
              {formatTime(elapsedTime)}
          </p>
      </div>

      <div className="mb-4">
        <label htmlFor={`preset-select-${id}`} className="sr-only">Select Game</label>
        <select
          id={`preset-select-${id}`}
          value={gamePresetId || ''}
          onChange={handlePresetChange}
          className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Default Pricing</option>
          {gamePresets.map(preset => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </select>
      </div>

      <div className="text-center mb-4">
        <p className="text-xl sm:text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
            {CURRENCY_SYMBOL}{cost.toFixed(2)}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">Current Cost</p>
      </div>
      
      {laps.length > 0 && (
        <div className="mb-4 border-t border-slate-200 dark:border-slate-700 pt-3 max-h-24 overflow-y-auto">
          <ol className="text-sm text-slate-500 dark:text-slate-400 space-y-1 pr-2">
            {laps.slice().reverse().map((lap, index) => (
                <li key={index} className="flex justify-between items-center">
                    <span>Lap {laps.length - index}</span>
                    <span className="font-mono">{formatTime(lap)}</span>
                </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex justify-center space-x-3 mt-auto">
        {(status === TimerStatus.STOPPED || status === TimerStatus.PAUSED) && (
          <button onClick={handleStart} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md" aria-label="Start stopwatch">
            <PlayIcon />
          </button>
        )}
        {status === TimerStatus.RUNNING && (
          <button onClick={handlePause} className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-md" aria-label="Pause stopwatch">
            <PauseIcon />
          </button>
        )}
        <button onClick={handleReset} className="p-3 bg-slate-500 text-white rounded-full hover:bg-slate-600 transition-colors shadow-md" aria-label="Reset stopwatch">
          <ResetIcon />
        </button>
        <button onClick={handleLap} className="p-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed" disabled={status !== TimerStatus.RUNNING} aria-label="Record lap">
          <FlagIcon />
        </button>
      </div>
    </div>
  );
};

export default StopwatchCard;
