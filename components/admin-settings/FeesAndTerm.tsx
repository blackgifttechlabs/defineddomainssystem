
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { DollarSign, Calendar, Info } from 'lucide-react';

export const FeesAndTerm: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [fees, setFees] = useState(settings?.feesAmount?.toString() || '');
  const [term, setTerm] = useState(settings?.currentTerm || '');
  const [termStart, setTermStart] = useState(settings?.nextTermStartDate || '');
  const borderStyle = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  useEffect(() => {
    setFees(settings.feesAmount.toString());
    setTerm(settings.currentTerm);
    setTermStart(settings.nextTermStartDate || '');
  }, [settings]);

  const handleUpdate = (updates: any) => {
    updateSettings(updates);
  };

  return (
    <div className="p-5 sm:p-6 max-w-3xl animate-in fade-in duration-500 space-y-6">
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">School Fees & Terms</h3>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-semibold tracking-wide text-black dark:text-white ml-1">Standard Fees Amount ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#154A70]" size={18} />
              <input
                type="number"
                value={fees}
                onChange={e => { setFees(e.target.value); handleUpdate({ feesAmount: parseFloat(e.target.value) || 0 }); }}
                className={`w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg text-sm font-medium text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all `}
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-semibold tracking-wide text-black dark:text-white ml-1">Current Term Name</label>
            <input
              type="text"
              value={term}
              onChange={e => { setTerm(e.target.value); handleUpdate({ currentTerm: e.target.value }); }}
              className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg text-sm font-medium tracking-tight text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all `}
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-semibold tracking-wide text-black dark:text-white ml-1">Next Term Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#154A70]" size={18} />
              <input
                type="date"
                value={termStart}
                onChange={e => { setTermStart(e.target.value); handleUpdate({ nextTermStartDate: e.target.value }); }}
                className={`w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg text-sm font-medium text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all `}
              />
            </div>
            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest px-1">Note: Changing this will automatically post a school-wide notice.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
