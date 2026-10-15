import React from 'react';
import { Bus, CalendarDays, ClipboardList, HeartPulse, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

const links = [
  { id: 'iep-plans', label: 'Education Plan', hint: 'Goals and sign-off', icon: ClipboardList },
  { id: 'schedule', label: 'Schedule', hint: 'Therapy sessions and timetable', icon: CalendarDays },
  { id: 'child-care', label: 'Care & Attendance', hint: 'Attendance, incidents, pickup codes', icon: HeartPulse },
  { id: 'transport', label: 'Transport', hint: 'Route and driver contact', icon: Bus },
];

export const ParentMore: React.FC = () => {
  const setActiveTab = useStore(s => s.setActiveTab);
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black text-slate-900">More</h2>
      {links.map(l => {
        const Icon = l.icon;
        return (
          <button key={l.id} onClick={() => setActiveTab(l.id)} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-[#7c3aed]"><Icon size={18} /></span>
            <span className="flex-1"><span className="block text-sm font-black text-slate-900">{l.label}</span><span className="text-[11px] font-semibold text-slate-500">{l.hint}</span></span>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        );
      })}
    </div>
  );
};
