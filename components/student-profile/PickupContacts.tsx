import React, { useState } from 'react';
import { AuthorisedPickup, Guardian, Student } from '../../types';
import { useStore } from '../../store/useStore';
import { useDailyStore } from '../../store/useDailyStore';
import { dailyBtn, dailyCard, dailyInput, useDailyData } from '../daily/dailyShared';
import { KeyRound, Phone, Trash2, UserCheck } from 'lucide-react';

const uid = () => Math.random().toString(36).substring(2, 10);
const newCode = () => String(Math.floor(100000 + Math.random() * 900000));

/** Emergency contacts, authorised pickup people with one-time codes, and the pickup log. */
export const PickupContacts: React.FC<{ student: Student }> = ({ student }) => {
  useDailyData();
  const { updateStudent, notify } = useStore();
  const { pickupLogs, addPickupLog } = useDailyStore();
  const guardians = student.guardians || [];
  const pickups = student.authorisedPickups || [];
  const [g, setG] = useState({ name: '', relationship: '', phone: '' });
  const [p, setP] = useState({ name: '', relationship: '', phone: '', idNumber: '' });
  const [entered, setEntered] = useState<Record<string, string>>({});

  const saveGuardians = (list: Guardian[]) => updateStudent(student.id, { guardians: list });
  const savePickups = (list: AuthorisedPickup[]) => updateStudent(student.id, { authorisedPickups: list });

  const addGuardian = async () => {
    if (!g.name.trim() || !g.phone.trim()) return notify('error', 'Name and phone are required.');
    await saveGuardians([...guardians, { id: uid(), ...g, isPrimary: guardians.length === 0 }]);
    setG({ name: '', relationship: '', phone: '' });
  };
  const addPickup = async () => {
    if (!p.name.trim()) return notify('error', 'Name is required.');
    await savePickups([...pickups, { id: uid(), ...p }]);
    setP({ name: '', relationship: '', phone: '', idNumber: '' });
  };
  const issueCode = (id: string) =>
    savePickups(pickups.map(x => x.id === id ? { ...x, pickupCode: newCode(), codeIssuedAt: new Date().toISOString() } : x));

  const release = async (person: AuthorisedPickup) => {
    if (!person.pickupCode || entered[person.id]?.trim() !== person.pickupCode) return notify('error', 'Pickup code does not match.');
    await addPickupLog({ studentId: student.id, studentName: student.fullName, pickupName: person.name, relationship: person.relationship, codeVerified: true });
    // One-time: burn the code after use.
    await savePickups(pickups.map(x => x.id === person.id ? { ...x, pickupCode: '', codeIssuedAt: '' } : x));
    setEntered(e => ({ ...e, [person.id]: '' }));
    notify('success', `${student.fullName} released to ${person.name}.`);
  };

  const logs = pickupLogs.filter(l => l.studentId === student.id);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 animate-in fade-in duration-300">
      <section className={`${dailyCard} p-5 space-y-3`}>
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Phone size={15} /> Emergency contacts</h3>
        {guardians.length === 0 && <p className="text-sm text-slate-500">No contacts recorded. Parent on file: {student.parentName} ({student.parentPhone}).</p>}
        {guardians.map(x => (
          <div key={x.id} className="flex items-center justify-between rounded-md border border-slate-200 p-2.5 text-sm dark:border-slate-700">
            <div><b>{x.name}</b> <span className="text-slate-500">{x.relationship}{x.isPrimary ? ' (primary)' : ''}</span><br /><a href={`tel:${x.phone}`} className="text-blue-600 font-semibold">{x.phone}</a></div>
            <button aria-label="Remove contact" onClick={() => saveGuardians(guardians.filter(y => y.id !== x.id))} className="text-rose-500"><Trash2 size={15} /></button>
          </div>
        ))}
        <div className="grid gap-2 sm:grid-cols-3">
          <input className={dailyInput} placeholder="Name" value={g.name} onChange={e => setG({ ...g, name: e.target.value })} />
          <input className={dailyInput} placeholder="Relationship" value={g.relationship} onChange={e => setG({ ...g, relationship: e.target.value })} />
          <input className={dailyInput} placeholder="Phone" value={g.phone} onChange={e => setG({ ...g, phone: e.target.value })} />
        </div>
        <button className={dailyBtn} onClick={addGuardian}>Add contact</button>
      </section>

      <section className={`${dailyCard} p-5 space-y-3`}>
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white"><UserCheck size={15} /> Authorised pickup</h3>
        {pickups.length === 0 && <p className="text-sm text-slate-500">No authorised pickup people yet.</p>}
        {pickups.map(x => (
          <div key={x.id} className="rounded-md border border-slate-200 p-2.5 text-sm space-y-2 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div><b>{x.name}</b> <span className="text-slate-500">{x.relationship} {x.phone && `| ${x.phone}`} {x.idNumber && `| ID ${x.idNumber}`}</span></div>
              <button aria-label="Remove person" onClick={() => savePickups(pickups.filter(y => y.id !== x.id))} className="text-rose-500"><Trash2 size={15} /></button>
            </div>
            {x.pickupCode ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-amber-50 px-2 py-1 font-mono text-xs font-bold text-amber-800 border border-amber-200">Code: {x.pickupCode}</span>
                <input className={`${dailyInput} !w-32`} placeholder="Enter code" value={entered[x.id] || ''} onChange={e => setEntered({ ...entered, [x.id]: e.target.value })} />
                <button className={dailyBtn} onClick={() => release(x)}>Release child</button>
              </div>
            ) : (
              <button onClick={() => issueCode(x.id)} className="flex items-center gap-1.5 text-xs font-bold text-blue-600"><KeyRound size={13} /> Issue one-time code</button>
            )}
          </div>
        ))}
        <div className="grid gap-2 sm:grid-cols-2">
          <input className={dailyInput} placeholder="Name" value={p.name} onChange={e => setP({ ...p, name: e.target.value })} />
          <input className={dailyInput} placeholder="Relationship" value={p.relationship} onChange={e => setP({ ...p, relationship: e.target.value })} />
          <input className={dailyInput} placeholder="Phone" value={p.phone} onChange={e => setP({ ...p, phone: e.target.value })} />
          <input className={dailyInput} placeholder="ID number (optional)" value={p.idNumber} onChange={e => setP({ ...p, idNumber: e.target.value })} />
        </div>
        <button className={dailyBtn} onClick={addPickup}>Add person</button>
      </section>

      <section className={`${dailyCard} p-5 xl:col-span-2`}>
        <h3 className="text-sm font-bold mb-3 text-slate-900 dark:text-white">Pickup log</h3>
        {logs.length === 0 ? <p className="text-sm text-slate-500">No pickups recorded.</p> : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {logs.map(l => (
              <li key={l.id} className="py-2 flex flex-wrap justify-between gap-2">
                <span><b>{l.pickupName}</b> ({l.relationship || 'n/a'}) - code verified</span>
                <span className="text-slate-500">{new Date(l.timestamp).toLocaleString()} | released by {l.releasedByName}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
