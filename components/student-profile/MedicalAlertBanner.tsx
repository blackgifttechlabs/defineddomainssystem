import React, { useState } from 'react';
import { MedicalAlerts, Student } from '../../types';
import { useStore } from '../../store/useStore';
import { AlertTriangle } from 'lucide-react';
import { dailyBtn, dailyInput } from '../daily/dailyShared';

const FIELDS: { key: keyof MedicalAlerts; label: string }[] = [
  { key: 'allergies', label: 'Allergies' },
  { key: 'seizures', label: 'Seizures' },
  { key: 'mobilityNeeds', label: 'Mobility needs' },
  { key: 'medication', label: 'Medication' },
  { key: 'other', label: 'Other alert' },
];

/** Prominent alert strip; renders nothing when the student has no alerts. */
export const MedicalAlertBanner: React.FC<{ student: Student }> = ({ student }) => {
  const active = FIELDS.filter(f => student.medicalAlerts?.[f.key]?.trim());
  if (!active.length) return null;
  return (
    <div role="alert" className="border-b border-rose-300 bg-rose-50 px-4 py-3 sm:px-6 md:px-8 dark:border-rose-900 dark:bg-rose-950/40">
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300">
        <AlertTriangle size={14} /> Medical alerts
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {active.map(f => (
          <span key={f.key} className="rounded-md border border-rose-300 bg-white px-2.5 py-1 text-xs font-bold text-rose-800 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-200">
            {f.label}: <span className="font-medium">{student.medicalAlerts![f.key]}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/** Staff editor; saves into the student's existing record (medicalAlerts field). */
export const MedicalAlertsEditor: React.FC<{ student: Student }> = ({ student }) => {
  const { updateStudent, notify } = useStore();
  const [form, setForm] = useState<MedicalAlerts>(student.medicalAlerts || {});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const clean: MedicalAlerts = {};
      FIELDS.forEach(f => { const v = form[f.key]?.trim(); if (v) clean[f.key] = v; });
      await updateStudent(student.id, { medicalAlerts: clean });
      notify('success', 'Medical alerts updated.');
    } catch (e: any) { notify('error', e.message); }
    setSaving(false);
  };

  return (
    <section className="mt-5 border border-rose-200 bg-white p-5 dark:border-rose-900 dark:bg-slate-900">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-rose-600">Safety flags</p>
      <h3 className="mt-0.5 mb-3 text-sm font-bold text-slate-900 dark:text-white">Medical alerts (shown on profile banner)</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map(f => (
          <label key={f.key} className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500">{f.label}</span>
            <input className={dailyInput} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder="Leave blank if none" />
          </label>
        ))}
      </div>
      <button className={`${dailyBtn} mt-4`} disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save alerts'}</button>
    </section>
  );
};
