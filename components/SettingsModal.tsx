import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GamePreset } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { PlusIcon, EditIcon, DeleteIcon, SaveIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cost: number, minutes: number, presets: GamePreset[]) => void;
  initialCost: number;
  initialMinutes: number;
  initialPresets: GamePreset[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialCost, initialMinutes, initialPresets }) => {
  const [activeTab, setActiveTab] = useState<'default' | 'games'>('default');
  const [cost, setCost] = useState(initialCost);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [presets, setPresets] = useState<GamePreset[]>([]);
  const [editingPreset, setEditingPreset] = useState<Partial<GamePreset> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCost(initialCost);
      setMinutes(initialMinutes);
      setPresets(JSON.parse(JSON.stringify(initialPresets))); // Deep copy
      setEditingPreset(null);
      setActiveTab('default');
    }
  }, [isOpen, initialCost, initialMinutes, initialPresets]);

  const handleSave = () => {
    onSave(cost, minutes, presets);
    onClose();
  };

  const handleAddNewPreset = () => {
    setEditingPreset({
      id: uuidv4(),
      name: '',
      costPerUnit: cost,
      minutesPerUnit: minutes,
    });
  };

  const handleSavePreset = () => {
    if (!editingPreset || !editingPreset.name || !editingPreset.id) return;

    const existing = presets.find(p => p.id === editingPreset.id);
    if (existing) {
      setPresets(presets.map(p => p.id === editingPreset!.id ? (editingPreset as GamePreset) : p));
    } else {
      setPresets([...presets, editingPreset as GamePreset]);
    }
    setEditingPreset(null);
  };

  const handleDeletePreset = (id: string) => {
    if (window.confirm("Are you sure you want to delete this game preset?")) {
      setPresets(presets.filter(p => p.id !== id));
    }
  };

  const handleNumberInput = (setter: React.Dispatch<React.SetStateAction<number>>, min: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value)) value = min;
    if (value < min) value = min;
    setter(value);
  };

  const tabButtonClasses = (tabName: 'default' | 'games') =>
    `px-4 py-2 text-sm font-medium rounded-t-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-800 ${
      activeTab === tabName
        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-0'
        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
    }`;
  
  if (!isOpen) return null;

  const renderPresetForm = () => (
    <div className="bg-slate-200 dark:bg-slate-900/50 p-3 rounded-lg space-y-3">
      <input
        type="text"
        placeholder="Game Name"
        value={editingPreset?.name || ''}
        onChange={(e) => setEditingPreset(p => ({...p, name: e.target.value}))}
        className="w-full text-base bg-white dark:bg-slate-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-500"
        autoFocus
      />
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Cost"
          value={editingPreset?.costPerUnit || ''}
          onChange={(e) => setEditingPreset(p => ({...p, costPerUnit: parseInt(e.target.value, 10) || 0}))}
          className="w-1/2 text-base bg-white dark:bg-slate-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Minutes"
          value={editingPreset?.minutesPerUnit || ''}
          onChange={(e) => setEditingPreset(p => ({...p, minutesPerUnit: parseInt(e.target.value, 10) || 0}))}
          className="w-1/2 text-base bg-white dark:bg-slate-700 rounded-md p-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => setEditingPreset(null)} className="px-3 py-1 text-sm rounded-md text-slate-700 dark:text-slate-200 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500">Cancel</button>
        <button onClick={handleSavePreset} className="px-3 py-1 text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save</button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="bg-slate-100 dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 pt-6">
          <h3 id="settings-title" className="text-xl font-bold mb-4 text-center">Pricing Settings</h3>
          <div className="border-b border-slate-300 dark:border-slate-700 -mb-px">
            <nav className="flex space-x-2" aria-label="Tabs">
              <button onClick={() => setActiveTab('default')} className={tabButtonClasses('default')}>Default</button>
              <button onClick={() => setActiveTab('games')} className={tabButtonClasses('games')}>Game Presets</button>
            </nav>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-b-lg">
          {activeTab === 'default' && (
            <div className="space-y-4">
               <div>
                <label htmlFor="cost-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Cost</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">{CURRENCY_SYMBOL}</span>
                  </div>
                  <input
                    id="cost-input"
                    type="number"
                    value={cost}
                    onChange={handleNumberInput(setCost, 1)}
                    className="w-full text-lg font-mono bg-slate-100 dark:bg-slate-700 rounded-md text-center py-2 pl-7 pr-4 outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="minutes-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Per Minutes</label>
                <div className="relative">
                  <input
                    id="minutes-input"
                    type="number"
                    value={minutes}
                    onChange={handleNumberInput(setMinutes, 1)}
                    className="w-full text-lg font-mono bg-slate-100 dark:bg-slate-700 rounded-md text-center py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="space-y-4">
              {presets.length > 0 && (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {presets.map(p => (
                    <li key={p.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-2 rounded-md">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{CURRENCY_SYMBOL}{p.costPerUnit} / {p.minutesPerUnit} min</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingPreset(p)} className="text-slate-500 hover:text-indigo-500"><EditIcon /></button>
                        <button onClick={() => handleDeletePreset(p.id)} className="text-slate-500 hover:text-red-500"><DeleteIcon /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {editingPreset ? renderPresetForm() : (
                <button onClick={handleAddNewPreset} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
                  <PlusIcon /> Add New Game
                </button>
              )}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
