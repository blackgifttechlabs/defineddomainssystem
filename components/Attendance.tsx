import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useDailyStore } from '../store/useDailyStore';
import { AttendanceStatus } from '../types';
import { dailyBtn, dailyCard, dailyInput, todayStr, useDailyData, useMyStudents } from './daily/dailyShared';
import { CalendarCheck } from 'lucide-react';

const STATUSES: AttendanceStatus[] = ['Present', 'Late', 'Absent'];
const statusStyle: Record<AttendanceStatus, string> = {
  Present: 'bg-emerald-600 text-white border-emerald-600',
  Late: 'bg-amber-500 text-white border-amber-500',
  Absent: 'bg-rose-600 text-white border-rose-600',
};

export const Attendance: React.FC = () => {
  useDailyData();
  const { settings } = useStore();
  const { attendance, saveAttendance } = useDailyStore();
  const myStudents = useMyStudents();
  const classes = useMemo(
    () => Array.from(new Set([...(settings.classes || []), ...myStudents.map(s => s.assignedClass)].filter(Boolean))).filter(c => myStudents.some(s => s.assignedClass === c)),
    [settings.classes, myStudents]
  );
  const [view, setView] = useState<'register' | 'history'>('register');
  const [className, setClassName] = useState('');
  const [date, setDate] = useState(todayStr());
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [historyStudent, setHistoryStudent] = useState('');

  useEffect(() => { if (!className && classes.length) setClassName(classes[0]); }, [classes, className]);

  const classStudents = useMemo(() => myStudents.filter(s => s.assignedClass === className), [myStudents, className]);
  const existing = attendance.find(a => a.date === date && a.className === className);

  useEffect(() => {
    // Load saved register, defaulting everyone to Present for a fresh one.
    const base: Record<string, AttendanceStatus> = {};
    classStudents.forEach(s => { base[s.id] = existing?.records?.[s.id] || 'Present'; });
    setMarks(base);
  }, [existing, classStudents]);

  const save = async () => {
    setSaving(true);
    await saveAttendance(date, className, marks);
    setSaving(false);
  };

  const rateFor = (studentId: string) => {
    let total = 0, absent = 0, late = 0;
    attendance.forEach(r => {
      const st = r.records?.[studentId];
      if (!st) return;
      total++;
      if (st === 'Absent') absent++;
      if (st === 'Late') late++;
    });
    return { total, absent, late, rate: total ? Math.round((absent / total) * 100) : 0 };
  };

  const histStudent = myStudents.find(s => s.id === historyStudent);
  const histRows = attendance.filter(r => histStudent && r.records?.[histStudent.id]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">Daily register</p>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><CalendarCheck size={20} /> Attendance</h1>
        </div>
        <div className="flex gap-2">
          {(['register', 'history'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3.5 py-1.5 rounded-[9px] text-xs font-bold border ${view === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'}`}>
              {v === 'register' ? 'Take register' : 'Student history'}
            </button>
          ))}
        </div>
      </div>

      {view === 'register' ? (
        <div className={`${dailyCard} p-4 space-y-4`}>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className={dailyInput} value={className} onChange={e => setClassName(e.target.value)}>
              {classes.length === 0 && <option value="">No classes with students</option>}
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" className={dailyInput} value={date} max={todayStr()} onChange={e => setDate(e.target.value)} />
          </div>
          {existing && <p className="text-xs font-medium text-slate-500">Register already taken by {existing.takenByName}. Saving will update it.</p>}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {classStudents.map(s => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{s.fullName}</span>
                <div className="flex gap-1.5">
                  {STATUSES.map(st => (
                    <button key={st} onClick={() => setMarks(m => ({ ...m, [s.id]: st }))}
                      className={`px-3 py-1 rounded-md border text-[11px] font-bold ${marks[s.id] === st ? statusStyle[st] : 'bg-white dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {className && classStudents.length === 0 && <p className="py-4 text-sm text-slate-500">No students in this class.</p>}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">
              {STATUSES.map(st => `${st}: ${Object.values(marks).filter(m => m === st).length}`).join('  |  ')}
            </p>
            <button className={dailyBtn} disabled={saving || !classStudents.length} onClick={save}>{saving ? 'Saving...' : 'Save register'}</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`${dailyCard} overflow-x-auto`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500">
                <tr><th className="p-3">Student</th><th className="p-3">Class</th><th className="p-3">Days</th><th className="p-3">Absent</th><th className="p-3">Late</th><th className="p-3">Absence rate</th></tr>
              </thead>
              <tbody>
                {myStudents.map(s => {
                  const r = rateFor(s.id);
                  return (
                    <tr key={s.id} onClick={() => setHistoryStudent(s.id)} className="cursor-pointer border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-100">{s.fullName}</td>
                      <td className="p-3 text-slate-500">{s.assignedClass}</td>
                      <td className="p-3">{r.total}</td><td className="p-3">{r.absent}</td><td className="p-3">{r.late}</td>
                      <td className={`p-3 font-bold ${r.rate >= 20 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-200'}`}>{r.total ? `${r.rate}%` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {histStudent && (
            <div className={`${dailyCard} p-4`}>
              <h3 className="text-sm font-bold mb-2 text-slate-900 dark:text-white">{histStudent.fullName} - history</h3>
              <div className="flex flex-wrap gap-2">
                {histRows.length === 0 && <p className="text-sm text-slate-500">No attendance recorded.</p>}
                {histRows.map(r => (
                  <span key={r.id} className={`px-2.5 py-1 rounded-md border text-[11px] font-bold ${statusStyle[r.records[histStudent.id]]}`}>{r.date}: {r.records[histStudent.id]}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
