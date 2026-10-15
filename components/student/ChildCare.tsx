import React, { useMemo } from 'react';
import { AlertTriangle, CalendarCheck, KeyRound } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useDailyStore } from '../../store/useDailyStore';
import { useDailyData } from '../daily/dailyShared';

const day = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

// Parent/student-facing view of the child's attendance, incident reports and pickup codes.
export const ChildCare: React.FC = () => {
  useDailyData();
  const { user, students, parents } = useStore();
  const { attendance, incidents } = useDailyStore();

  const student = useMemo(() => {
    if (user?.role === 'STUDENT') return students.find(s => s.firebaseUid === user.id);
    const p = parents.find(x => x.firebaseUid === user?.id);
    return p ? students.find(s => s.id === p.studentId) : undefined;
  }, [user, students, parents]);

  const history = useMemo(() => {
    if (!student) return [];
    return attendance
      .filter(r => r.records && r.records[student.id])
      .map(r => ({ date: r.date, status: r.records[student.id] }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, student]);

  const myIncidents = useMemo(
    () => (student ? incidents.filter(i => i.studentId === student.id) : []),
    [incidents, student]
  );

  if (!student) return <p className="p-4 text-sm font-semibold text-slate-500">No linked student found.</p>;

  const absent = history.filter(h => h.status === 'Absent').length;
  const late = history.filter(h => h.status === 'Late').length;
  const pickups = (student.authorisedPickups || []).filter(p => p.name);

  return (
    <div className="space-y-5 pb-4">
      <h2 className="text-lg font-black text-slate-900">{student.fullName}: care & attendance</h2>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><CalendarCheck size={14} /> Attendance</h3>
        {history.length === 0 ? <p className="text-sm text-slate-500">No attendance recorded yet.</p> : (
          <>
            <p className="mb-3 text-sm font-semibold text-slate-700">{history.length} days recorded · {absent} absent · {late} late</p>
            <ul className="max-h-56 space-y-1 overflow-y-auto">
              {history.slice(0, 60).map(h => (
                <li key={h.date} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-bold">
                  <span>{day(h.date)}</span>
                  <span className={h.status === 'Present' ? 'text-emerald-600' : h.status === 'Late' ? 'text-amber-600' : 'text-rose-600'}>{h.status}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><AlertTriangle size={14} /> Incident & injury reports</h3>
        {myIncidents.length === 0 ? <p className="text-sm text-slate-500">No incidents reported.</p> : (
          <ul className="space-y-2">
            {myIncidents.map(i => (
              <li key={i.id} className="rounded-xl bg-slate-50 p-3 text-xs">
                <p className="font-black text-slate-800">{i.kind} · {i.severity} <span className="font-semibold text-slate-400">· {day(i.timestamp)}</span></p>
                <p className="mt-1 text-slate-700">{i.description}</p>
                {i.actionTaken && <p className="mt-1 text-slate-500">Action taken: {i.actionTaken}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500"><KeyRound size={14} /> Authorised pickup</h3>
        <p className="mb-3 text-[11px] text-slate-500">Give the one-time code only to the person collecting your child. The school will ask for it.</p>
        {pickups.length === 0 ? <p className="text-sm text-slate-500">No authorised pickup people on file.</p> : (
          <ul className="space-y-2">
            {pickups.map(p => (
              <li key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                <span className="font-bold text-slate-800">{p.name} <span className="font-semibold text-slate-400">({p.relationship})</span></span>
                {p.pickupCode
                  ? <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 font-mono font-bold text-amber-800">Code: {p.pickupCode}</span>
                  : <span className="text-slate-400">No active code</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
