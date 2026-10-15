import React, { useMemo, useState } from 'react';
import { BellRing, Download, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useI18n } from '../utils/i18n';
import { downloadCsv } from '../utils/exportCsv';

export const FeeArrears: React.FC = () => {
  const { students, parents, settings, sendDirectNotice, notify } = useStore();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  const fee = settings.feesAmount || 0;

  const rows = useMemo(() => {
    return students
      .map(s => {
        const parent = parents.find(p => p.studentId === s.id);
        const paid = s.totalPaid || 0;
        return {
          student: s,
          parent,
          paid,
          owed: Math.max(0, fee - paid),
          recipientUserId: parent?.firebaseUid || s.firebaseUid || ''
        };
      })
      .filter(r => r.owed > 0 && r.student.fullName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.owed - a.owed);
  }, [students, parents, fee, search]);

  const totalOwed = rows.reduce((sum, r) => sum + r.owed, 0);

  const remind = async (r: (typeof rows)[number]) => {
    if (!r.recipientUserId) {
      notify('error', `No parent account linked for ${r.student.fullName}.`);
      return false;
    }
    const ok = await sendDirectNotice(
      r.recipientUserId,
      r.student.id,
      `Fee Reminder: ${r.student.fullName}`,
      `Dear ${r.parent?.name || 'parent'}, ${r.student.fullName} has an outstanding school fee balance of $${r.owed} for ${settings.currentTerm} ($${r.paid} paid of $${fee}). Please settle the balance or visit the school office. Thank you.`,
      'Fees',
      r.parent ? 'PARENT' : 'ALL'
    );
    if (ok) setSent(prev => ({ ...prev, [r.student.id]: true }));
    return ok;
  };

  const remindAll = async () => {
    setBusy(true);
    let count = 0;
    for (const r of rows) {
      if (sent[r.student.id] || !r.recipientUserId) continue;
      if (await remind(r)) count++;
    }
    setBusy(false);
    notify('success', `${count} reminder${count === 1 ? '' : 's'} sent.`);
  };

  const exportRows = () =>
    downloadCsv('fee-arrears',
      ['Student', 'Class', 'Parent', 'Parent Phone', 'Fee', 'Paid', 'Owed'],
      rows.map(r => [r.student.fullName, r.student.assignedClass, r.parent?.name || r.student.parentName, r.parent?.phone || r.student.parentPhone, fee, r.paid, r.owed]));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#22c55e]">{settings.currentTerm}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{t('arrears.title')}</h1>
          <p className="mt-1 text-[11px] font-bold text-slate-500">
            {rows.length} accounts owe a total of ${totalOwed} (fee per student: ${fee})
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportRows} className="h-10 rounded-full border border-slate-200 bg-white px-4 text-[11px] font-black text-slate-700 flex items-center gap-1.5">
            <Download size={14} /> CSV
          </button>
          <button onClick={remindAll} disabled={busy || rows.length === 0} className="h-10 rounded-full bg-[#7c3aed] px-4 text-[11px] font-black text-white flex items-center gap-1.5 disabled:opacity-50">
            <BellRing size={14} /> {t('arrears.remindAll')}
          </button>
        </div>
      </header>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#7c3aed]" />
      </div>

      <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Owed</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.student.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-black text-slate-950">{r.student.fullName}<span className="block text-[10px] font-bold text-slate-500">{r.student.assignedClass}</span></td>
                <td className="px-4 py-3 font-bold text-slate-700">{r.parent?.name || r.student.parentName}<span className="block text-[10px] text-slate-500">{r.parent?.phone || r.student.parentPhone}</span></td>
                <td className="px-4 py-3 text-right font-bold text-slate-700">${r.paid}</td>
                <td className="px-4 py-3 text-right font-black text-rose-600">${r.owed}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remind(r)} disabled={sent[r.student.id] || !r.recipientUserId} className="rounded-full bg-[#f2e8ff] px-3 py-1.5 text-[10px] font-black text-[#7c3aed] disabled:opacity-50">
                    {sent[r.student.id] ? 'Sent' : t('arrears.remind')}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center font-bold text-slate-500">No outstanding balances.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
