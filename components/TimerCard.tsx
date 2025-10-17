import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TimerState, TimerStatus, GamePreset } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { PlayIcon, PauseIcon, ResetIcon, EditIcon, SaveIcon, DeleteIcon, ClockIcon } from './icons';

interface TimerCardProps {
  timer: TimerState;
  onUpdate: (id: string, updates: Partial<TimerState>) => void;
  onDelete: (id: string) => void;
  onReset: (id: string) => void;
  costPerUnit: number;
  minutesPerUnit: number;
  gamePresets: GamePreset[];
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

interface TimeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (totalSeconds: number) => void;
  initialDuration: number;
}

const TimeEditModal: React.FC<TimeEditModalProps> = ({ isOpen, onClose, onSave, initialDuration }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const parseDuration = useCallback((duration: number) => {
    setHours(Math.floor(duration / 3600));
    setMinutes(Math.floor((duration % 3600) / 60));
    setSeconds(duration % 60);
  }, []);

  useEffect(() => {
    if (isOpen) {
      parseDuration(initialDuration);
    }
  }, [isOpen, initialDuration, parseDuration]);
  
  const handleSave = () => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    onSave(totalSeconds);
    onClose();
  };
  
  const handleNumberInput = (setter: React.Dispatch<React.SetStateAction<number>>, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > max) value = max;
    setter(value);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="time-edit-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="time-edit-title" className="text-xl font-bold mb-4 text-center">Set Timer Duration</h3>
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-6">
          <div className="text-center">
             <label htmlFor="hours-input" className="text-xs text-slate-500">Hours</label>
            <input 
              id="hours-input"
              type="number" 
              value={hours.toString().padStart(2, '0')} 
              onChange={handleNumberInput(setHours, 99)}
              className="w-20 sm:w-24 text-3xl sm:text-4xl font-mono bg-slate-100 dark:bg-slate-700 rounded-md text-center outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="99"
            />
          </div>
          <span className="text-3xl sm:text-4xl font-mono text-slate-400 pt-5">:</span>
          <div className="text-center">
            <label htmlFor="minutes-input" className="text-xs text-slate-500">Minutes</label>
            <input 
              id="minutes-input"
              type="number" 
              value={minutes.toString().padStart(2, '0')} 
              onChange={handleNumberInput(setMinutes, 59)}
              className="w-20 sm:w-24 text-3xl sm:text-4xl font-mono bg-slate-100 dark:bg-slate-700 rounded-md text-center outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="59"
            />
          </div>
          <span className="text-3xl sm:text-4xl font-mono text-slate-400 pt-5">:</span>
          <div className="text-center">
            <label htmlFor="seconds-input" className="text-xs text-slate-500">Seconds</label>
            <input 
              id="seconds-input"
              type="number" 
              value={seconds.toString().padStart(2, '0')} 
              onChange={handleNumberInput(setSeconds, 59)}
              className="w-20 sm:w-24 text-3xl sm:text-4xl font-mono bg-slate-100 dark:bg-slate-700 rounded-md text-center outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              max="59"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


const TimerCard: React.FC<TimerCardProps> = ({ timer, onUpdate, onDelete, onReset, costPerUnit, minutesPerUnit, gamePresets }) => {
  const { id, name, initialDuration, remainingTime, status, costAnchor, gamePresetId } = timer;
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Alarm sound from a public domain source
    const soundUrl = 'https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3';
    audioRef.current = new Audio(soundUrl);
  }, []);

  useEffect(() => {
    if (status === TimerStatus.RUNNING) {
      intervalRef.current = window.setInterval(() => {
        onUpdate(id, { remainingTime: timer.remainingTime - 1 });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    
    if (remainingTime <= 0 && status === TimerStatus.RUNNING) {
      onUpdate(id, { status: TimerStatus.FINISHED, remainingTime: 0 });
      audioRef.current?.play();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, remainingTime, onUpdate, id, timer.remainingTime]);
  
  const handleStart = () => onUpdate(id, { status: TimerStatus.RUNNING });
  const handlePause = () => onUpdate(id, { status: TimerStatus.PAUSED });
  
  const handleReset = () => {
    onReset(id);
  };
  
  const handleNameSave = () => {
    if (tempName.trim()) {
      onUpdate(id, { name: tempName.trim() });
    }
    setIsEditingName(false);
  };
  
  const handleTimeSave = (newDuration: number) => {
    if (status === TimerStatus.STOPPED && newDuration >= 0) {
        onUpdate(id, { 
          initialDuration: newDuration, 
          remainingTime: newDuration,
          costAnchor: newDuration
        });
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

    const elapsedTime = costAnchor - remainingTime;
    if (elapsedTime <= 0 || currentMinutesPerUnit === 0) return 0;
    
    const elapsedMinutes = elapsedTime / 60;
    return (elapsedMinutes / currentMinutesPerUnit) * currentCostPerUnit;
  }, [costAnchor, remainingTime, costPerUnit, minutesPerUnit, gamePresetId, gamePresets]);

  const progress = useMemo(() => {
    if (initialDuration === 0) return 0;
    return ((initialDuration - remainingTime) / initialDuration) * 100;
  }, [initialDuration, remainingTime]);

  const cardColorClasses = {
    [TimerStatus.STOPPED]: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    [TimerStatus.RUNNING]: 'bg-green-50 dark:bg-green-900/50 border-green-500',
    [TimerStatus.PAUSED]: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-500',
    [TimerStatus.FINISHED]: 'bg-red-50 dark:bg-red-900/50 border-red-500 animate-finish-pulse',
  };

  return (
    <>
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
            <button onClick={() => isEditingName ? handleNameSave() : setIsEditingName(true)} className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              {isEditingName ? <SaveIcon /> : <EditIcon />}
            </button>
            <button onClick={() => onDelete(id)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
              <DeleteIcon />
            </button>
          </div>
        </div>
        
        <div className="my-2 text-center">
            <div className="relative inline-flex items-center justify-center group">
                <p className={`text-4xl sm:text-5xl font-fjalla tracking-tighter ${status === TimerStatus.FINISHED ? 'text-red-500' : ''}`}>
                    {formatTime(remainingTime)}
                </p>
                {status === TimerStatus.STOPPED && (
                    <button
                        onClick={() => setIsTimeModalOpen(true)}
                        className="absolute left-full ml-2 p-1 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Edit duration"
                    >
                        <ClockIcon />
                    </button>
                )}
            </div>
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
          <p className="text-xs text-slate-400 dark:text-slate-500">
              {status === TimerStatus.FINISHED ? "Time Over!" : "Current Cost"}
          </p>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-5">
          <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="flex justify-center space-x-3 mt-auto">
          {(status === TimerStatus.STOPPED || status === TimerStatus.PAUSED || status === TimerStatus.FINISHED) && (
            <button onClick={handleStart} className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md disabled:bg-slate-400" disabled={remainingTime <= 0}>
              <PlayIcon />
            </button>
          )}
          {status === TimerStatus.RUNNING && (
            <button onClick={handlePause} className="p-3 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-md">
              <PauseIcon />
            </button>
          )}
          <button onClick={handleReset} className="p-3 bg-slate-500 text-white rounded-full hover:bg-slate-600 transition-colors shadow-md">
            <ResetIcon />
          </button>
        </div>
      </div>
      <TimeEditModal
          isOpen={isTimeModalOpen}
          onClose={() => setIsTimeModalOpen(false)}
          onSave={handleTimeSave}
          initialDuration={initialDuration}
      />
    </>
  );
};

export default TimerCard;
