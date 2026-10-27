import React from 'react';
import { ArrowUpRight, Bell, FileText, Receipt } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, milestoneRecords, clinicalLogs, settings, notices, setActiveTab } = useStore();
  const parent = parents.find(p => p.firebaseUid === user?.id || p.id === user?.id);
  const student = user?.role === 'PARENT' ? students.find(s => s.id === parent?.studentId) : students.find(s => s.firebaseUid === user?.id);
  const assessments = milestoneRecords.filter(r => r.studentId === student?.id);
  const lessons = clinicalLogs.filter(r => r.studentId === student?.id);
  const updates = notices.filter(n => (n.target === 'ALL' || n.target === user?.role) && (!n.recipientUserId || n.recipientUserId === user?.id)).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 4);
  const balance = Math.max(0, (settings.feesAmount || 0) - (student?.totalPaid || 0));
  return <div className="space-y-8">
    <header><h1 className="text-2xl font-semibold tracking-tight">Home</h1><p className="mt-2 text-sm text-neutral-500">{user?.name}</p></header>
    <section className="flex items-center gap-4 rounded-xl border border-neutral-200 p-5">
      {student?.imageUrl && <img src={student.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />}
      <div><h2 className="text-lg font-semibold">{student?.fullName || 'Student'}</h2><p className="mt-1 text-sm text-neutral-500">{student?.assignedClass || 'No class assigned'}</p></div>
    </section>
    <section className="grid gap-3 sm:grid-cols-3">
      {[
        { label: 'Assessments', value: assessments.length, icon: FileText, tab: 'clinical-history' },
        { label: 'Lessons', value: lessons.length, icon: FileText, tab: 'clinical-history' },
        { label: 'Fees due', value: `$${balance.toLocaleString()}`, icon: Receipt, tab: 'fees' },
      ].map(item => <button key={item.label} onClick={() => setActiveTab(item.tab)} className="rounded-xl border border-neutral-200 p-5 text-left hover:border-[#3b1764]">
        <div className="flex items-center justify-between text-neutral-500"><span className="flex items-center gap-2 text-sm"><item.icon size={17} />{item.label}</span><ArrowUpRight size={16} /></div>
        <p className="mt-4 text-2xl font-semibold text-[#3b1764]">{item.value}</p>
      </button>)}
    </section>
    <section>
      <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">Notices</h2><button onClick={() => setActiveTab('notices')} className="min-h-11 text-sm text-[#3b1764]">View all</button></div>
      <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">{updates.length ? updates.map(notice => <button key={notice.id} onClick={() => setActiveTab('notices')} className="flex w-full items-center gap-3 p-4 text-left hover:bg-neutral-50">
        <Bell size={18} className="shrink-0 text-[#3b1764]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{notice.title}</p><p className="mt-1 text-xs text-neutral-500">{new Date(notice.timestamp).toLocaleDateString()}</p></div><ArrowUpRight size={16} className="text-neutral-400" />
      </button>) : <p className="p-6 text-sm text-neutral-500">No notices yet.</p>}</div>
    </section>
  </div>;
};
