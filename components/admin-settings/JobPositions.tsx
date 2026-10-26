
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Edit2, Check, Briefcase } from 'lucide-react';

export const JobPositions: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [newPosName, setNewPosName] = useState('');
  const [editingPos, setEditingPos] = useState<{ original: string, current: string } | null>(null);
  const borderStyle = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  const handleAddPosition = () => {
    if (newPosName && !settings.positions.find(p => p.name === newPosName)) {
      updateSettings({ positions: [...settings.positions, { name: newPosName, active: true }] });
      setNewPosName('');
    }
  };

  return (
    <div className="p-5 sm:p-6 max-w-4xl animate-in fade-in duration-500 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-none">Job Positions</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Configure roles for applications</p>
        </div>
        <div className="flex gap-2">
          <input
            value={newPosName}
            onChange={e => setNewPosName(e.target.value)}
            placeholder="Role title..."
            className={`px-6 py-4 text-xs bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg font-bold text-black dark:text-white outline-none w-full sm:w-64 `}
          />
          <button onClick={handleAddPosition} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"><Plus size={24}/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-1 bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 ">
        {settings.positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900">
            <Briefcase size={48} className="text-slate-100" />
            <p className="text-[10px] font-semibold text-slate-300 italic tracking-wide">No positions set</p>
          </div>
        ) : settings.positions.map(pos => (
          <div key={pos.name} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 group">
            {editingPos?.original === pos.name ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  value={editingPos.current}
                  onChange={e => setEditingPos({...editingPos, current: e.target.value})}
                  className="text-sm font-semibold text-[#154A70] outline-none w-full border-b-2 border-slate-200 dark:border-slate-700"
                  autoFocus
                />
                <button onClick={() => { updateSettings({ positions: settings.positions.map(p => p.name === pos.name ? {...p, name: editingPos.current} : p) }); setEditingPos(null); }} className="p-2 bg-blue-600 text-white"><Check size={16} /></button>
              </div>
            ) : (
              <span className={`text-sm font-semibold ${pos.active ? 'text-slate-900 dark:text-white' : 'text-slate-300 line-through'}`}>{pos.name}</span>
            )}
            <div className="flex items-center gap-2 opacity-100 transition-all">
              <button onClick={() => updateSettings({ positions: settings.positions.map(p => p.name === pos.name ? {...p, active: !p.active} : p) })} className={`px-4 py-2 text-[8px] font-semibold border ${pos.active ? 'text-emerald-600 border-emerald-100' : 'text-slate-400 border-slate-100'}`}>{pos.active ? 'Live' : 'Hidden'}</button>
              <button onClick={() => setEditingPos({ original: pos.name, current: pos.name })} className="p-3 text-slate-400 hover:text-blue-600"><Edit2 size={18}/></button>
              <button onClick={() => updateSettings({ positions: settings.positions.filter(p => p.name !== pos.name) })} className="p-3 text-slate-400 hover:text-rose-600"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
