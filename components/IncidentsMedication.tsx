import React, { useState } from 'react';
import { useDailyStore } from '../store/useDailyStore';
import { IncidentReport } from '../types';
import { dailyBtn, dailyCard, dailyInput, useDailyData, useMyStudents } from './daily/dailyShared';
import { Pill, ShieldAlert } from 'lucide-react';

export const IncidentsMedication: React.FC = () => {
  useDailyData();
  const students = useMyStudents();
  const { incidents, medicationLogs, addIncident, addMedicationLog } = useDailyStore();
  const [tab, setTab] = useState<'incidents' | 'medication'>('incidents');
  const [studentId, setStudentId] = useState('');
  const [inc, setInc] = useState({ kind: 'Incident' as IncidentReport['kind'], severity: 'Minor' as IncidentReport['severity'], description: '', actionTaken: '', parentNotified: true });
  const [med, setMed] = useState({ medication: '', dose: '', notes: '' });
  const [busy, setBusy] = useState(false);

  const student = students.find(s => s.id === studentId);
  const alerts = student?.medicalAlerts;

  const submitIncident = async () => {
    if (!student || !inc.description.trim()) return;
    setBusy(true);
    await addIncident({ ...inc, studentId: student.id, studentName: student.fullName });
    setInc({ ...inc, description: '', actionTaken: '' });
    setBusy(false);
  };
  const submitMed = async () => {
    if (!student || !med.medication.trim() || !med.dose.trim()) return;
    setBusy(true);
    await addMedicationLog({ ...med, studentId: student.id, studentName: student.fullName });
    setMed({ medication: '', dose: '', notes: '' });
    setBusy(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600">Care log</p>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Incidents and medication</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('incidents')} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-xs font-bold border ${tab === 'incidents' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'}`}><ShieldAlert size={13} /> Incidents</button>
          <button onClick={() => setTab('medication')} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[9px] text-xs font-bold border ${tab === 'medication' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700'}`}><Pill size={13} /> Medication</button>
        </div>
      </div>

      <div className={`${dailyCard} p-4 space-y-3`}>
        <select className={dailyInput} value={studentId} onChange={e => setStudentId(e.target.value)}>
          <option value="">Select student...</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName} - {s.assignedClass}</option>)}
        </select>
        {alerts && Object.values(alerts).some(Boolean) && (
          <p className="rounded-md border border-rose-300 bg-rose-50 p-2.5 text-xs font-bold text-rose-800">
            Medical alerts: {Object.entries(alerts).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(' | ')}
          </p>
        )}

        {tab === 'incidents' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <select className={dailyInput} value={inc.kind} onChange={e => setInc({ ...inc, kind: e.target.value as any })}><option>Incident</option><option>Injury</option></select>
              <select className={dailyInput} value={inc.severity} onChange={e => setInc({ ...inc, severity: e.target.value as any })}><option>Minor</option><option>Moderate</option><option>Serious</option></select>
            </div>
            <textarea className={dailyInput} rows={3} placeholder="What happened?" value={inc.description} onChange={e => setInc({ ...inc, description: e.target.value })} />
            <textarea className={dailyInput} rows={2} placeholder="Action taken" value={inc.actionTaken} onChange={e => setInc({ ...inc, actionTaken: e.target.value })} />
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={inc.parentNotified} onChange={e => setInc({ ...inc, parentNotified: e.target.checked })} /> Send notice to parent
            </label>
            <button className={dailyBtn} disabled={busy || !student} onClick={submitIncident}>Save report</button>
          </>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={dailyInput} placeholder="Medication" value={med.medication} onChange={e => setMed({ ...med, medication: e.target.value })} />
              <input className={dailyInput} placeholder="Dose (e.g. 5ml)" value={med.dose} onChange={e => setMed({ ...med, dose: e.target.value })} />
            </div>
            <input className={dailyInput} placeholder="Notes (optional)" value={med.notes} onChange={e => setMed({ ...med, notes: e.target.value })} />
            <p className="text-[11px] text-slate-500">Logged under your name with the current time. The parent receives a notice.</p>
            <button className={dailyBtn} disabled={busy || !student} onClick={submitMed}>Log administration</button>
          </>
        )}
      </div>

      <div className={`${dailyCard} p-4`}>
        <h3 className="text-sm font-bold mb-3 text-slate-900 dark:text-white">{tab === 'incidents' ? 'Recent reports' : 'Recent administrations'}</h3>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {tab === 'incidents'
            ? incidents.filter(i => !studentId || i.studentId === studentId).map(i => (
              <li key={i.id} className="py-2.5">
                <div className="flex flex-wrap justify-between gap-2"><b>{i.studentName} - {i.severity} {i.kind.toLowerCase()}</b><span className="text-slate-500 text-xs">{new Date(i.timestamp).toLocaleString()} | {i.reportedByName}</span></div>
                <p className="text-slate-600 dark:text-slate-300">{i.description}</p>
                {i.actionTaken && <p className="text-xs text-slate-500">Action: {i.actionTaken}</p>}
              </li>))
            : medicationLogs.filter(m => !studentId || m.studentId === studentId).map(m => (
              <li key={m.id} className="py-2.5 flex flex-wrap justify-between gap-2">
                <span><b>{m.studentName}</b>: {m.medication}, {m.dose}{m.notes && ` (${m.notes})`}</span>
                <span className="text-slate-500 text-xs">{new Date(m.timestamp).toLocaleString()} | given by {m.givenByName}</span>
              </li>))}
        </ul>
      </div>
    </div>
  );
};
