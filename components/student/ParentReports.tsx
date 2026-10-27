import React, { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Download, FileText } from 'lucide-react';
import { MilestoneRecord, SessionLog, Student } from '../../types';

type Report = { kind: 'assessment'; record: MilestoneRecord } | { kind: 'lesson'; record: SessionLog };
const dateLabel = (date: string) => new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const ParentReports: React.FC<{
  student: Student;
  assessments: MilestoneRecord[];
  lessons: SessionLog[];
  onDownload: (log: SessionLog) => void;
  exporting: boolean;
}> = ({ student, assessments, lessons, onDownload, exporting }) => {
  const [selected, setSelected] = useState<Report | null>(null);
  const [filter, setFilter] = useState('All');
  const reports: Report[] = [
    ...assessments.map(record => ({ kind: 'assessment' as const, record })),
    ...lessons.map(record => ({ kind: 'lesson' as const, record })),
  ].sort((a, b) => new Date(b.kind === 'assessment' ? b.record.timestamp : b.record.date).getTime() - new Date(a.kind === 'assessment' ? a.record.timestamp : a.record.date).getTime());
  const title = (report: Report) => report.kind === 'assessment' ? `${report.record.ageCategory} checklist` : report.record.targetBehavior;
  const date = (report: Report) => report.kind === 'assessment' ? report.record.timestamp : report.record.date;
  const score = (report: Report) => Math.round(report.kind === 'assessment' ? report.record.overallPercentage : report.record.independenceScore);

  if (selected) {
    const rows = selected.kind === 'assessment'
      ? selected.record.sections.flatMap(section => section.items.map(item => ({ area: section.title, text: item.text, result: item.checked ? 'Achieved' : 'Pending' })))
      : selected.record.steps.map((step, index) => ({ area: `${index + 1}`, text: step.description, result: step.promptLevel === '+' ? 'Achieved' : 'Support needed' }));
    return <div className="space-y-6">
      <button onClick={() => setSelected(null)} className="inline-flex min-h-11 items-center gap-2 text-sm text-neutral-600 hover:text-[#3b1764]"><ArrowLeft size={17} />Reports</button>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-sm text-neutral-500">{student.fullName}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{title(selected)}</h1><p className="mt-2 text-sm text-neutral-500">{dateLabel(date(selected))}</p></div>
        {selected.kind === 'lesson' && <button disabled={exporting} onClick={() => onDownload(selected.record)} className="parent-primary"><Download size={16} />{exporting ? 'Saving…' : 'Download'}</button>}
      </header>
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-5 py-4"><span className="text-sm text-neutral-500">Score</span><span className="text-xl font-semibold text-[#3b1764]">{score(selected)}%</span></div>
      <div className="parent-table-wrap"><table className="parent-table"><caption className="sr-only">Checklist results</caption><thead><tr><th>{selected.kind === 'assessment' ? 'Area' : 'Step'}</th><th>Skill</th><th>Result</th></tr></thead><tbody>
        {rows.map((row, index) => <tr key={index}><td>{row.area}</td><td>{row.text}</td><td><span className={`parent-result ${row.result === 'Achieved' ? 'is-achieved' : ''}`}>{row.result}</span></td></tr>)}
        {!rows.length && <tr><td colSpan={3}>No skills recorded.</td></tr>}
      </tbody></table></div>
      {selected.kind === 'assessment' && selected.record.redFlags.length > 0 && <section className="space-y-3"><h2 className="text-base font-semibold">Warning signs</h2><div className="parent-table-wrap"><table className="parent-table"><thead><tr><th>Sign</th><th>Result</th></tr></thead><tbody>{selected.record.redFlags.map((flag, index) => <tr key={index}><td>{flag.text}</td><td>{flag.checked ? 'Observed' : 'Not observed'}</td></tr>)}</tbody></table></div></section>}
    </div>;
  }

  const visible = reports.filter(report => filter === 'All' || (filter === 'Assessments' ? report.kind === 'assessment' : report.kind === 'lesson'));
  return <div className="space-y-6">
    <header><h1 className="text-2xl font-semibold tracking-tight">Reports</h1><p className="mt-2 text-sm text-neutral-500">{student.fullName}</p></header>
    <div className="flex gap-2" aria-label="Report type">{['All', 'Assessments', 'Lessons'].map(label => <button key={label} aria-pressed={filter === label} onClick={() => setFilter(label)} className={`min-h-11 rounded-lg px-4 text-sm ${filter === label ? 'bg-[#3b1764] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{label}</button>)}</div>
    {visible.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map(report => <button key={`${report.kind}-${report.record.id}`} onClick={() => { setSelected(report); window.scrollTo({ top: 0 }); }} className="group rounded-xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-[#3b1764] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3b1764]">
      <div className="flex items-center justify-between"><FileText size={20} className="text-[#3b1764]" /><ArrowUpRight size={18} className="text-neutral-400 group-hover:text-[#3b1764]" /></div>
      <p className="mt-5 text-xs text-neutral-500">{report.kind === 'assessment' ? 'Assessment' : 'Lesson'}</p>
      <h2 className="mt-1 text-base font-semibold">{title(report)}</h2>
      <div className="mt-5 flex items-center justify-between gap-2 text-sm"><span className="text-neutral-500">{dateLabel(date(report))}</span><span className="font-medium text-[#3b1764]">{score(report)}%</span></div>
    </button>)}</div> : <div className="rounded-xl border border-dashed border-neutral-200 py-16 text-center text-sm text-neutral-500">No reports yet.</div>}
  </div>;
};
