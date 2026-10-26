import React, { useMemo, useState } from 'react';
import { Bus, Download, Phone, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { TransportRoute } from '../types';
import { useI18n } from '../utils/i18n';
import { downloadCsv } from '../utils/exportCsv';

const uid = () => Math.random().toString(36).substring(2, 9);
const blankRoute = (): Omit<TransportRoute, 'id'> & { id?: string } => ({
  name: '', driverName: '', driverPhone: '', vehicleReg: '', capacity: 0, stops: [], assignments: []
});

export const Transport: React.FC = () => {
  const { user, students, parents, transportRoutes, saveTransportRoute, deleteTransportRoute, notify } = useStore();
  const { t } = useI18n();
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_SUPPORT';
  const [draft, setDraft] = useState<(Omit<TransportRoute, 'id'> & { id?: string }) | null>(null);

  const myStudentId = useMemo(() => {
    if (user?.role === 'PARENT') return parents.find(p => p.firebaseUid === user.id)?.studentId;
    if (user?.role === 'STUDENT') return students.find(s => s.firebaseUid === user.id)?.id;
    return undefined;
  }, [user, parents, students]);
  const isFamily = user?.role === 'PARENT' || user?.role === 'STUDENT';

  const visibleRoutes = isFamily
    ? transportRoutes.filter(r => r.assignments.some(a => a.studentId === myStudentId))
    : transportRoutes;

  const studentName = (id: string) => students.find(s => s.id === id)?.fullName || 'Unknown';

  const exportPickup = (route: TransportRoute) =>
    downloadCsv(`pickup-${route.name}`, ['Stop', 'Time', 'Student', 'Parent', 'Parent Phone'],
      route.stops.flatMap(stop =>
        route.assignments.filter(a => a.stopId === stop.id).map(a => {
          const s = students.find(x => x.id === a.studentId);
          return [stop.name, stop.time, s?.fullName, s?.parentName, s?.parentPhone];
        })));

  const update = (patch: Partial<NonNullable<typeof draft>>) => setDraft(d => (d ? { ...d, ...patch } : d));

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { notify('info', 'Route name is required.'); return; }
    await saveTransportRoute(draft);
    setDraft(null);
  };

  const input = 'min-w-0 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
  const card = 'rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900';

  return (
    <div className="management-page">
      <header className="management-page-header">
        <div>
          <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950 dark:text-white md:text-lg">{t('transport.title')}</h1>
          <p className="mt-1 text-[11px] font-medium text-slate-500">Routes, stops, pickup lists and driver contacts.</p>
        </div>
        {canEdit && !draft && (
          <button onClick={() => setDraft(blankRoute())} className="shrink-0 h-10 rounded-md bg-slate-950 dark:bg-white dark:text-slate-950 px-4 text-[11px] font-semibold text-white flex items-center gap-1.5">
            <Plus size={14} /> New route
          </button>
        )}
      </header>

      {draft && (
        <section className={`${card} space-y-3`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input className={input} placeholder="Route name" value={draft.name} onChange={e => update({ name: e.target.value })} />
            <input className={input} placeholder="Vehicle registration" value={draft.vehicleReg} onChange={e => update({ vehicleReg: e.target.value })} />
            <input className={input} placeholder="Driver name" value={draft.driverName} onChange={e => update({ driverName: e.target.value })} />
            <input className={input} placeholder="Driver phone" value={draft.driverPhone} onChange={e => update({ driverPhone: e.target.value })} />
            <input className={input} type="number" min={0} placeholder="Capacity" value={draft.capacity || ''} onChange={e => update({ capacity: Number(e.target.value) })} />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Stops</p>
            {draft.stops.map((stop, i) => (
              <div key={stop.id} className="flex gap-2">
                <input className={input} placeholder="Stop name" value={stop.name} onChange={e => update({ stops: draft.stops.map((s, j) => j === i ? { ...s, name: e.target.value } : s) })} />
                <input className={`${input} max-w-[110px]`} type="time" value={stop.time} onChange={e => update({ stops: draft.stops.map((s, j) => j === i ? { ...s, time: e.target.value } : s) })} />
                <button aria-label="Remove stop" onClick={() => update({ stops: draft.stops.filter((_, j) => j !== i), assignments: draft.assignments.filter(a => a.stopId !== stop.id) })} className="shrink-0 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => update({ stops: [...draft.stops, { id: uid(), name: '', time: '' }] })} className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">+ Add stop</button>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Students ({draft.assignments.length}{draft.capacity ? `/${draft.capacity}` : ''})</p>
            {draft.assignments.map((a, i) => (
              <div key={a.studentId} className="flex items-center gap-2">
                <span className="flex-1 truncate text-xs font-medium text-slate-900 dark:text-white">{studentName(a.studentId)}</span>
                <select className={`${input} max-w-[160px]`} value={a.stopId} onChange={e => update({ assignments: draft.assignments.map((x, j) => j === i ? { ...x, stopId: e.target.value } : x) })}>
                  <option value="">Stop...</option>
                  {draft.stops.map(s => <option key={s.id} value={s.id}>{s.name || '(unnamed)'}</option>)}
                </select>
                <button aria-label="Remove student" onClick={() => update({ assignments: draft.assignments.filter((_, j) => j !== i) })} className="shrink-0 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
              </div>
            ))}
            <select className={input} value="" onChange={e => e.target.value && update({ assignments: [...draft.assignments, { studentId: e.target.value, stopId: draft.stops[0]?.id || '' }] })}>
              <option value="">+ Add student...</option>
              {students
                .filter(s => !draft.assignments.some(a => a.studentId === s.id))
                .map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="h-10 flex-1 rounded-md bg-slate-950 dark:bg-white dark:text-slate-950 text-[11px] font-semibold text-white">Save route</button>
            <button onClick={() => setDraft(null)} className="h-10 rounded-md border border-slate-200 px-4 text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300">Cancel</button>
          </div>
        </section>
      )}

      {visibleRoutes.length === 0 && !draft && (
        <section className={`${card} text-center py-14`}>
          <div className="mx-auto h-12 w-12 rounded-md bg-slate-100 text-slate-400 grid place-items-center"><Bus size={18} /></div>
          <p className="mt-4 text-sm font-semibold">{isFamily ? 'No transport assigned' : 'No routes yet'}</p>
        </section>
      )}

      {visibleRoutes.map(route => (
        <section key={route.id} className={`${card} space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{route.name}</p>
              <p className="text-[11px] font-medium text-slate-500">
                {route.vehicleReg || 'No vehicle'} · {route.assignments.length}{route.capacity ? `/${route.capacity}` : ''} students
              </p>
              {route.driverName && (
                <a href={route.driverPhone ? `tel:${route.driverPhone}` : undefined} className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <Phone size={12} /> {route.driverName} {route.driverPhone}
                </a>
              )}
            </div>
            {!isFamily && (
              <div className="flex shrink-0 gap-1.5">
                <button aria-label="Export pickup list" onClick={() => exportPickup(route)} className="h-8 w-8 rounded-md border border-slate-200 text-slate-600 grid place-items-center dark:border-slate-800 dark:text-slate-300"><Download size={13} /></button>
                {canEdit && <button onClick={() => setDraft(route)} className="h-8 rounded-md bg-slate-100 dark:bg-slate-800 px-3 text-[10px] font-semibold text-slate-600 dark:text-slate-300">Edit</button>}
                {canEdit && <button aria-label="Delete route" onClick={() => window.confirm(`Delete route ${route.name}?`) && deleteTransportRoute(route.id)} className="h-8 w-8 rounded-md border border-slate-200 text-slate-400 hover:text-rose-600 grid place-items-center dark:border-slate-800"><Trash2 size={13} /></button>}
              </div>
            )}
          </div>
          <div className="space-y-2">
            {route.stops.map(stop => {
              const onStop = route.assignments.filter(a => a.stopId === stop.id && (!isFamily || a.studentId === myStudentId));
              return (
                <div key={stop.id} className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{stop.time || '--:--'} · {stop.name}</p>
                  {onStop.length > 0 && <p className="mt-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">{onStop.map(a => studentName(a.studentId)).join(', ')}</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
