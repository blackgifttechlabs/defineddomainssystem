import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { IepGoal, IepGoalStatus, IepPlan } from '../types';

const STATUSES: IepGoalStatus[] = ['Not Started', 'In Progress', 'Achieved', 'Discontinued'];
const statusStyle: Record<IepGoalStatus, string> = {
  'Not Started': 'bg-slate-100 text-slate-600',
  'In Progress': 'bg-amber-100 text-amber-700',
  Achieved: 'bg-emerald-100 text-emerald-700',
  Discontinued: 'bg-rose-100 text-rose-700',
};
const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
const labelCls = 'text-[10px] font-black uppercase tracking-widest text-slate-400';

const newGoal = (): IepGoal => ({
  id: Math.random().toString(36).slice(2, 9),
  area: '', goal: '', strategies: '', reviewDate: '', status: 'Not Started',
});

export const IepPlans: React.FC = () => {
  const { students, staff, iepPlans, user, settings, loadPlanningData, saveIepPlan, signOffIep, deleteIepPlan } = useStore();
  useEffect(() => { loadPlanningData(); }, []);

  const role = user?.role;
  const canEdit = role === 'SUPER_ADMIN' || role === 'SPECIALIST' || role === 'ADMIN_SUPPORT';
  const [studentId, setStudentId] = useState('');
  const [editing, setEditing] = useState<Partial<IepPlan> | null>(null);

  const plans = useMemo(
    () => iepPlans
      .filter(p => !studentId || p.studentId === studentId)
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')),
    [iepPlans, studentId]
  );

  const startNew = () => {
    const s = students.find(x => x.id === studentId);
    if (!s) return;
    setEditing({
      studentId: s.id, studentName: s.fullName, term: settings?.currentTerm || '',
      startDate: new Date().toISOString().slice(0, 10), reviewDate: '', goals: [newGoal()], signOffs: [],
    });
  };

  const updateGoal = (id: string, patch: Partial<IepGoal>) =>
    setEditing(e => e && { ...e, goals: (e.goals || []).map(g => (g.id === id ? { ...g, ...patch } : g)) });

  const save = async () => {
    if (!editing?.studentId) return;
    await saveIepPlan({
      id: editing.id, studentId: editing.studentId, studentName: editing.studentName || '',
      term: editing.term || '', startDate: editing.startDate || '', reviewDate: editing.reviewDate || '',
      goals: (editing.goals || []).filter(g => g.goal.trim()), signOffs: editing.signOffs || [],
    });
    setEditing(null);
  };

  const myStaff = staff.find(st => st.id === user?.id);
  const isAssigned = (studentId: string) => {
    const st = students.find(x => x.id === studentId);
    if (!st || !myStaff) return false;
    return st.assignedStaffId === myStaff.id || (myStaff.assignedClasses || []).includes(st.assignedClass);
  };
  const signRole = role === 'PARENT' || role === 'STUDENT' ? 'PARENT' : role === 'SPECIALIST' ? 'THERAPIST' : 'TEACHER';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            <ClipboardList size={22} className="text-purple-600" /> Education Plans
          </h1>
          <p className="text-sm text-slate-500">Individual goals, strategies and reviews, signed by parent and therapist.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={studentId} onChange={e => setStudentId(e.target.value)} className={inputCls + ' !w-56'}>
            <option value="">{canEdit ? 'All students' : 'Select student'}</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </select>
          {canEdit && (
            <button disabled={!studentId} onClick={startNew}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white disabled:opacity-40">
              <Plus size={14} /> New plan
            </button>
          )}
        </div>
      </div>

      {plans.length === 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          No education plans yet{canEdit ? '. Pick a student and create one.' : '.'}
        </div>
      )}

      {plans.map(plan => {
        const signed = (r: string) => (plan.signOffs || []).find(s => s.role === r);
        return (
          <div key={plan.id} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white">{plan.studentName}</p>
                <p className="text-xs text-slate-500">{plan.term} · Started {plan.startDate} · Review {plan.reviewDate || 'not set'}</p>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(plan)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">Edit</button>
                  {role === 'SUPER_ADMIN' && (
                    <button onClick={() => window.confirm('Delete this plan?') && deleteIepPlan(plan.id)} className="rounded-lg bg-rose-50 p-1.5 text-rose-600"><Trash2 size={14} /></button>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {(plan.goals || []).map(g => (
                <div key={g.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{g.goal}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${statusStyle[g.status]}`}>{g.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{g.area}{g.area && ' · '}Review {g.reviewDate || 'n/a'}</p>
                  {g.strategies && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Strategies: {g.strategies}</p>}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              {(['PARENT', 'THERAPIST'] as const).map(r => {
                const s = signed(r);
                return (
                  <span key={r} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${s ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <CheckCircle2 size={12} /> {r === 'PARENT' ? 'Parent' : 'Therapist'}: {s ? `${s.name} (${s.signedAt.slice(0, 10)})` : 'awaiting'}
                  </span>
                );
              })}
              {role !== 'SUPER_ADMIN' && !signed(signRole) && (signRole === 'PARENT' || (signRole === 'THERAPIST' && isAssigned(plan.studentId))) && (
                <button onClick={() => signOffIep(plan.id, signRole)} className="ml-auto rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-black uppercase text-white">Sign off</button>
              )}
            </div>
          </div>
        );
      })}

      {editing && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-slate-900 sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Plan for {editing.studentName}</h2>
              <button onClick={() => setEditing(null)} className="p-1 text-slate-400"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><p className={labelCls}>Term</p><input className={inputCls} value={editing.term || ''} onChange={e => setEditing({ ...editing, term: e.target.value })} /></div>
              <div><p className={labelCls}>Start</p><input type="date" className={inputCls} value={editing.startDate || ''} onChange={e => setEditing({ ...editing, startDate: e.target.value })} /></div>
              <div><p className={labelCls}>Plan review</p><input type="date" className={inputCls} value={editing.reviewDate || ''} onChange={e => setEditing({ ...editing, reviewDate: e.target.value })} /></div>
            </div>
            {(editing.goals || []).map((g, i) => (
              <div key={g.id} className="space-y-2 rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <p className={labelCls}>Goal {i + 1}</p>
                  <button onClick={() => setEditing({ ...editing, goals: (editing.goals || []).filter(x => x.id !== g.id) })} className="text-rose-500"><Trash2 size={14} /></button>
                </div>
                <input className={inputCls} placeholder="Area (e.g. Communication)" value={g.area} onChange={e => updateGoal(g.id, { area: e.target.value })} />
                <textarea className={inputCls} rows={2} placeholder="Goal" value={g.goal} onChange={e => updateGoal(g.id, { goal: e.target.value })} />
                <textarea className={inputCls} rows={2} placeholder="Strategies" value={g.strategies} onChange={e => updateGoal(g.id, { strategies: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className={inputCls} value={g.reviewDate} onChange={e => updateGoal(g.id, { reviewDate: e.target.value })} />
                  <select className={inputCls} value={g.status} onChange={e => updateGoal(g.id, { status: e.target.value as IepGoalStatus })}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <button onClick={() => setEditing({ ...editing, goals: [...(editing.goals || []), newGoal()] })} className="text-xs font-black uppercase text-purple-600">+ Add goal</button>
            <button onClick={save} className="w-full rounded-xl bg-purple-600 py-3 text-xs font-black uppercase tracking-wider text-white">Save plan</button>
          </div>
        </div>
      )}
    </div>
  );
};
