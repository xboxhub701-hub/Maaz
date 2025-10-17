import React from 'react';
import { CURRENCY_SYMBOL } from '../constants';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalEarnings: number;
}

const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose, onConfirm, totalEarnings }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="billing-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="billing-title" className="text-xl font-bold mb-4 text-center">Reset & Bill Session</h3>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
          This will save the current total earnings to history and reset the amount to zero for the next session.
        </p>
        
        <div className="text-center bg-slate-100 dark:bg-slate-700 p-4 rounded-lg mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">Total to be Billed</p>
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
            {CURRENCY_SYMBOL}{totalEarnings.toFixed(2)}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md"
          >
            Reset & Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingModal;
