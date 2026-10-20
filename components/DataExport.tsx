import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useI18n } from '../utils/i18n';
import { downloadCsv } from '../utils/exportCsv';

export const DataExport: React.FC = () => {
  const { students, payments, staff, settings } = useStore();
  const { t } = useI18n();
  const [className, setClassName] = useState('');

  const staffName = (id: string) => staff.find(s => s.id === id)?.fullName || '';
  const today = new Date().toISOString().slice(0, 10);

  const exportStudents = () =>
    downloadCsv(`students-${today}`,
      ['Name', 'Gender', 'Type of Autism', 'Date of Birth', 'Class', 'Teacher', 'Enrolled', 'Parent', 'Parent Phone', 'Parent Email', 'Address', 'Diagnosis', 'Total Paid'],
      students.map(s => [s.fullName, s.gender, s.autismType || '', s.dob, s.assignedClass, staffName(s.assignedStaffId), s.enrollmentDate, s.parentName, s.parentPhone, s.parentEmail, s.homeAddress, s.diagnosis, s.totalPaid || 0]));

  const exportPayments = () =>
    downloadCsv(`payments-${today}`,
      ['Date', 'Student', 'Amount', 'Method', 'Reference', 'Confirmed'],
      payments.map(p => [p.timestamp, p.studentName, p.amount, p.method, p.reference, p.isMock ? 'No' : 'Yes']));

  // No attendance data exists yet: this is a printable class register template.
  const exportRegister = () => {
    const list = students.filter(s => !className || s.assignedClass === className);
    downloadCsv(`class-register-${className || 'all'}-${today}`,
      ['Name', 'Class', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      list.map(s => [s.fullName, s.assignedClass, '', '', '', '', '']));
  };

  const exportClassLists = () =>
    downloadCsv(`class-lists-${today}`,
      ['Class', 'Name', 'Gender', 'Teacher', 'Parent', 'Parent Phone'],
      [...students]
        .sort((a, b) => (a.assignedClass || '').localeCompare(b.assignedClass || '') || a.fullName.localeCompare(b.fullName))
        .map(s => [s.assignedClass, s.fullName, s.gender, staffName(s.assignedStaffId), s.parentName, s.parentPhone]));

  const items = [
    { title: 'Students', desc: `${students.length} records with guardian and class details`, action: exportStudents },
    { title: 'Payments', desc: `${payments.length} payment records`, action: exportPayments },
    { title: 'Class lists', desc: 'All students grouped by class with teacher and guardian contacts', action: exportClassLists },
  ];

  return (
    <div className="space-y-4">
      <header>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#22c55e]">Reports</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{t('export.title')}</h1>
        <p className="mt-1 text-[11px] font-bold text-slate-500">Downloads open directly in Excel. Fee arrears can be exported from the Fee Arrears page.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <button key={item.title} onClick={item.action} className="rounded-[24px] border border-slate-200 bg-white p-4 text-left flex items-center gap-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] hover:border-[#7c3aed]">
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#f2e8ff] text-[#7c3aed] grid place-items-center"><FileSpreadsheet size={16} /></div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-950">{item.title}</p>
              <p className="text-[11px] font-bold text-slate-500">{item.desc}</p>
            </div>
            <Download size={14} className="text-slate-400" />
          </button>
        ))}

        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#f2e8ff] text-[#7c3aed] grid place-items-center"><FileSpreadsheet size={16} /></div>
            <div>
              <p className="text-sm font-black text-slate-950">Class register</p>
              <p className="text-[11px] font-bold text-slate-500">Blank weekly attendance sheet</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select value={className} onChange={e => setClassName(e.target.value)} className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900">
              <option value="">All classes</option>
              {settings.classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={exportRegister} className="h-9 rounded-full bg-[#7c3aed] px-4 text-[11px] font-black text-white">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
};
