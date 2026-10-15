import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TherapyType, TimetableSlot } from '../types';

const DAYS: TimetableSlot['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const THERAPIES: TherapyType[] = ['Speech', 'Occupational', 'Physio', 'Other'];
const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const card = 'rounded-3xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900';

export const SchedulePlanner: React.FC = () => {
  const { students, staff, settings, user, therapySessions, timetableSlots, loadPlanningData,
    bookTherapySession, updateTherapySession, saveTimetableSlot, deleteTimetableSlot } = useStore();
  useEffect(() => { loadPlanningData(); }, []);

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'SPECIALIST' || user?.role === 'ADMIN_SUPPORT';
  const [tab, setTab] = useState<'therapy' | 'timetable'>('therapy');

  // therapy form
  const [t, setT] = useState({ studentId: '', therapyType: 'Speech' as TherapyType, therapistId: '', date: '', time: '', durationMins: 30, notes: '', remind: true });
  // timetable form
  const classes = settings?.classes || [];
  const [className, setClassName] = useState('');
  const [slot, setSlot] = useState({ day: 'Monday' as TimetableSlot['day'], startTime: '08:00', endTime: '09:00', subject: '', staffName: '' });

  const upcoming = useMemo(
    () => [...therapySessions].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [therapySessions]
  );
  const activeClass = className || classes[0] || '';
  const daySlots = (d: string) => timetableSlots.filter(s => s.className === activeClass && s.day === d).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const book = async () => {
    const st = students.find(s => s.id === t.studentId);
    const th = staff.find(s => s.id === t.therapistId);
    if (!st || !th || !t.date || !t.time) return;
    await bookTherapySession({
      studentId: st.id, studentName: st.fullName, therapyType: t.therapyType,
      therapistId: th.id, therapistName: th.fullName, date: t.date, time: t.time,
      durationMins: t.durationMins, notes: t.notes,
    }, t.remind);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            <CalendarClock size={22} className="text-purple-600" /> Schedule
          </h1>
          <p className="text-sm text-slate-500">Therapy bookings and class timetables.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['therapy', 'timetable'] as const).map(k => (
            <button key={k} onClick={() => setTab(k)}
              className={`rounded-lg px-4 py-1.5 text-xs font-black uppercase ${tab === k ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400'}`}>
              {k === 'therapy' ? 'Therapy' : 'Timetable'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'therapy' && (
        <>
          {canEdit && (
            <div className={card + ' grid gap-3 sm:grid-cols-3'}>
              <select className={inputCls} value={t.studentId} onChange={e => setT({ ...t, studentId: e.target.value })}>
                <option value="">Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
              <select className={inputCls} value={t.therapyType} onChange={e => setT({ ...t, therapyType: e.target.value as TherapyType })}>
                {THERAPIES.map(x => <option key={x}>{x}</option>)}
              </select>
              <select className={inputCls} value={t.therapistId} onChange={e => setT({ ...t, therapistId: e.target.value })}>
                <option value="">Therapist</option>
                {staff.filter(s => s.role === 'SPECIALIST' || s.role === 'ADMIN_SUPPORT').map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
              <input type="date" className={inputCls} value={t.date} onChange={e => setT({ ...t, date: e.target.value })} />
              <input type="time" className={inputCls} value={t.time} onChange={e => setT({ ...t, time: e.target.value })} />
              <input type="number" min={10} step={5} className={inputCls} value={t.durationMins} onChange={e => setT({ ...t, durationMins: Number(e.target.value) })} />
              <input className={inputCls + ' sm:col-span-3'} placeholder="Notes (optional)" value={t.notes} onChange={e => setT({ ...t, notes: e.target.value })} />
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 sm:col-span-2">
                <input type="checkbox" checked={t.remind} onChange={e => setT({ ...t, remind: e.target.checked })} /> Send reminder notice to parent
              </label>
              <button onClick={book} className="rounded-xl bg-purple-600 py-2.5 text-xs font-black uppercase tracking-wider text-white">Book session</button>
            </div>
          )}
          <div className={card + ' space-y-2'}>
            {upcoming.length === 0 && <p className="text-sm text-slate-500">No sessions booked.</p>}
            {upcoming.map(s => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{s.studentName} · {s.therapyType}</p>
                  <p className="text-xs text-slate-500">{s.date} {s.time} · {s.durationMins} min · {s.therapistName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${s.status === 'Booked' ? 'bg-amber-100 text-amber-700' : s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{s.status}</span>
                  {canEdit && s.status === 'Booked' && (
                    <>
                      <button onClick={() => updateTherapySession(s.id, { status: 'Completed' })} className="text-xs font-bold text-emerald-600">Done</button>
                      <button onClick={() => updateTherapySession(s.id, { status: 'Cancelled' })} className="text-xs font-bold text-rose-600">Cancel</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'timetable' && (
        <>
          <select className={inputCls + ' !w-56'} value={activeClass} onChange={e => setClassName(e.target.value)}>
            {classes.length === 0 && <option value="">No classes configured</option>}
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          {canEdit && activeClass && (
            <div className={card + ' grid gap-3 sm:grid-cols-5'}>
              <select className={inputCls} value={slot.day} onChange={e => setSlot({ ...slot, day: e.target.value as TimetableSlot['day'] })}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
              <input type="time" className={inputCls} value={slot.startTime} onChange={e => setSlot({ ...slot, startTime: e.target.value })} />
              <input type="time" className={inputCls} value={slot.endTime} onChange={e => setSlot({ ...slot, endTime: e.target.value })} />
              <input className={inputCls} placeholder="Subject" value={slot.subject} onChange={e => setSlot({ ...slot, subject: e.target.value })} />
              <button onClick={() => slot.subject && saveTimetableSlot({ ...slot, className: activeClass })} className="rounded-xl bg-purple-600 text-xs font-black uppercase text-white">Add slot</button>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-5">
            {DAYS.map(d => (
              <div key={d} className={card + ' !p-3'}>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-purple-600">{d}</p>
                {daySlots(d).length === 0 && <p className="text-xs text-slate-400">Free</p>}
                {daySlots(d).map(s => (
                  <div key={s.id} className="mb-2 flex items-start justify-between gap-1 rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{s.subject}</p>
                      <p className="text-[10px] text-slate-500">{s.startTime} - {s.endTime}</p>
                    </div>
                    {canEdit && <button onClick={() => deleteTimetableSlot(s.id)} className="text-rose-500"><Trash2 size={12} /></button>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
