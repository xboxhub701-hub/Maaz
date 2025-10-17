import React from 'react';
import { BillingRecord } from '../types';
import { CURRENCY_SYMBOL } from '../constants';

interface HistoryViewProps {
  history: BillingRecord[];
  onClearHistory: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory }) => {
  const totalBilled = history.reduce((acc, record) => acc + record.amount, 0);

  if (history.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-slate-500 dark:text-slate-400">No billing history yet.</h2>
        <p className="text-slate-400 dark:text-slate-500 mt-2">When you "Reset & Bill", the records will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold">Billing History</h2>
           <p className="text-slate-500 dark:text-slate-400">Total Billed: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{CURRENCY_SYMBOL}{totalBilled.toFixed(2)}</span></p>
        </div>
        <button
          onClick={onClearHistory}
          className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm text-sm"
        >
          Clear History
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {history.map(record => (
            <li key={record.id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div>
                <p className="font-semibold">
                  {new Date(record.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(record.date).toLocaleTimeString()}
                </p>
              </div>
              <p className="text-lg font-mono font-semibold text-green-600 dark:text-green-400">
                {CURRENCY_SYMBOL}{record.amount.toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HistoryView;
