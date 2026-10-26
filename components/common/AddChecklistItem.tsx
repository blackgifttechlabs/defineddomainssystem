import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export const AddChecklistItem: React.FC<{ onAdd: (text: string) => void; category: string }> = ({ onAdd, category }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg border border-dashed border-blue-300 px-3 py-2.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"><Plus size={15} /> Add custom checklist item</button>;
  return <form className="flex flex-wrap gap-2" onSubmit={event => {
    event.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
    setOpen(false);
  }}>
    <input autoFocus aria-label={`Custom checklist item for ${category}`} value={text} onChange={event => setText(event.target.value)} placeholder="Describe the checklist item" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
    <button type="submit" disabled={!text.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">Add item</button>
    <button type="button" aria-label="Cancel custom item" onClick={() => { setText(''); setOpen(false); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
  </form>;
};
