
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, X, Building, Pencil, Check } from 'lucide-react';

export const Classes: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [newClassName, setNewClassName] = useState('');
  const [editingClass, setEditingClass] = useState<{ original: string; name: string } | null>(null);
  const trimmedName = editingClass?.name.trim() || '';
  const duplicateName = settings.classes.some(name => name !== editingClass?.original && name.toLowerCase() === trimmedName.toLowerCase());

  const handleSaveClass = () => {
    if (!editingClass || !trimmedName || duplicateName) return;
    updateSettings({ classes: settings.classes.map(name => name === editingClass.original ? trimmedName : name) });
    setEditingClass(null);
  };
  const borderStyle = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  const handleAddClass = () => {
    if (newClassName && !settings.classes.includes(newClassName)) {
      updateSettings({ classes: [...settings.classes, newClassName] });
      setNewClassName('');
    }
  };

  return (
    <div className="p-5 sm:p-6 max-w-3xl animate-in fade-in duration-500 space-y-6">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-4 tracking-tight"><Building size={24}/> School Classes</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={newClassName}
          onChange={e => setNewClassName(e.target.value)}
          placeholder="New class label (e.g. Nursery)..."
          className={`min-w-0 flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg text-sm font-bold text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all `}
        />
        <button onClick={handleAddClass} className="p-2.5 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-all"><Plus size={24} /></button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
        {settings.classes.map(c => (
          <div key={c} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 border ${borderStyle} rounded-lg group hover:border-blue-400 transition-all`}>
            {editingClass?.original === c ? (
              <form className="min-w-0 flex-1 space-y-2" onSubmit={event => { event.preventDefault(); handleSaveClass(); }}>
                <div className="flex flex-wrap items-center gap-2">
                  <input autoFocus aria-label="Class name" value={editingClass.name} onChange={event => setEditingClass({ ...editingClass, name: event.target.value })} onKeyDown={event => { if (event.key === 'Escape') setEditingClass(null); }} className={`min-w-0 flex-1 rounded-lg border ${borderStyle} bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:bg-slate-900 dark:text-white`} />
                  <button type="submit" disabled={!trimmedName || duplicateName} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Check size={14} /> Save</button>
                  <button type="button" onClick={() => setEditingClass(null)} className="rounded-lg px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Cancel</button>
                </div>
                {duplicateName && <p role="alert" className="text-xs text-rose-600">A class with this name already exists.</p>}
              </form>
            ) : (
              <>
                <span className="min-w-0 flex-1 break-words text-xs font-medium text-slate-700 dark:text-white">{c}</span>
                <button type="button" onClick={() => setEditingClass({ original: c, name: c })} aria-label={`Edit ${c}`} className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"><Pencil size={14} /> Edit</button>
                <button aria-label={`Delete ${c}`} onClick={() => updateSettings({ classes: settings.classes.filter(cls => cls !== c) })} className="text-slate-400 hover:text-rose-600 opacity-100 transition-all p-2"><X size={20}/></button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
