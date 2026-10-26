
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, X } from 'lucide-react';

export const DefaultTasks: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [newTaskStep, setNewTaskStep] = useState('');
  const borderStyle = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  const handleAddTaskStep = () => {
    if (newTaskStep && !settings.defaultTaskSteps?.includes(newTaskStep)) {
      const next = [...(settings.defaultTaskSteps || []), newTaskStep];
      updateSettings({ defaultTaskSteps: next });
      setNewTaskStep('');
    }
  };

  return (
    <div className="p-5 sm:p-6 max-w-3xl animate-in fade-in duration-500 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-none">Task Templates</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Pre-set steps for Teacher logs</p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskStep}
          onChange={e => setNewTaskStep(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTaskStep()}
          placeholder="Enter new step description..."
          className={`min-w-0 flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg text-sm font-bold text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all `}
        />
        <button onClick={handleAddTaskStep} className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all"><Plus size={24} /></button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
        {(settings.defaultTaskSteps || []).map(step => (
          <div key={step} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border ${borderStyle} rounded-lg group hover:border-blue-400 transition-all`}>
            <span className="text-xs font-medium text-slate-700 dark:text-white">{step}</span>
            <button onClick={() => updateSettings({ defaultTaskSteps: settings.defaultTaskSteps?.filter(s => s !== step) })} className="text-slate-400 hover:text-rose-600 opacity-100 transition-all p-2"><X size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};
