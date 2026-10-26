import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useStore } from '../store/useStore';

const LogoImg = 'https://i.ibb.co/spSVqW8s/definedlogo.png';
const inputCls = 'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export const TermReports: React.FC = () => {
  const state = useStore() as any;
  const { students, clinicalLogs, milestoneRecords, iepPlans, settings, loadPlanningData, notify } = state;
  useEffect(() => { loadPlanningData(); }, []);

  const [studentId, setStudentId] = useState('');
  const [from, setFrom] = useState(isoDay(new Date(Date.now() - 90 * 86400000)));
  const [to, setTo] = useState(isoDay(new Date()));
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const student = students.find((s: any) => s.id === studentId);

  const data = useMemo(() => {
    if (!student) return null;
    const inRange = (d?: string) => !!d && d.slice(0, 10) >= from && d.slice(0, 10) <= to;
    const logs = (clinicalLogs || []).filter((l: any) => l.studentId === student.id && inRange(l.date));
    const miles = (milestoneRecords || []).filter((m: any) => m.studentId === student.id && inRange(m.timestamp));
    const plans = (iepPlans || []).filter((p: any) => p.studentId === student.id);
    // Attendance does not exist in this branch; read defensively if another module adds it.
    const att = Array.isArray(state.attendance)
      ? state.attendance.filter((a: any) => a.studentId === student.id && inRange(a.date))
      : null;
    const avg = logs.length ? Math.round(logs.reduce((n: number, l: any) => n + (l.independenceScore || 0), 0) / logs.length) : null;
    const byTarget: Record<string, number[]> = {};
    logs.forEach((l: any) => { (byTarget[l.targetBehavior || 'General'] ||= []).push(l.independenceScore || 0); });
    return { logs, miles, plans, att, avg, byTarget };
  }, [student, from, to, clinicalLogs, milestoneRecords, iepPlans, state.attendance]);

  const generate = async () => {
    if (!student || !data) return;
    setBusy(true);
    try {
      const pdf = new jsPDF();
      try { pdf.addImage(LogoImg, 'PNG', 14, 10, 18, 18); } catch { /* logo is optional */ }
      pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
      pdf.text('Defined Domains Inclusive School', 36, 17);
      pdf.setFontSize(11); pdf.setFont('helvetica', 'normal');
      pdf.text(`Term Report${settings?.currentTerm ? ` - ${settings.currentTerm}` : ''}`, 36, 24);
      pdf.setFontSize(10);
      pdf.text(`Student: ${student.fullName}    Class: ${student.assignedClass || '-'}    DOB: ${student.dob || '-'}`, 14, 38);
      pdf.text(`Period: ${from} to ${to}    Diagnosis: ${student.diagnosis || '-'}    Gender: ${student.gender || '-'}    Autism type: ${student.autismType || '-'}`, 14, 44);

      let y = 50;
      const section = (title: string) => { if (y > 250) { pdf.addPage(); y = 20; } pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.text(title, 14, y); pdf.setFont('helvetica', 'normal'); y += 3; };
      const after = () => { y = (pdf as any).lastAutoTable.finalY + 8; };

      section('Attendance');
      if (data.att) {
        const present = data.att.filter((a: any) => /present|late/i.test(a.status || '')).length;
        autoTable(pdf, { startY: y, head: [['Days recorded', 'Present', 'Absent', 'Rate']], body: [[data.att.length, present, data.att.length - present, data.att.length ? `${Math.round((present / data.att.length) * 100)}%` : '-']], headStyles: { fillColor: [124, 58, 237] } });
      } else {
        autoTable(pdf, { startY: y, body: [['Attendance is not recorded in the system for this period.']], theme: 'plain' });
      }
      after();

      section('Skills and Task Analysis');
      autoTable(pdf, {
        startY: y, head: [['Target behaviour', 'Sessions', 'Avg independence']],
        body: Object.keys(data.byTarget).length
          ? Object.entries(data.byTarget).map(([t, v]) => [t, v.length, `${Math.round(v.reduce((a, b) => a + b, 0) / v.length)}%`])
          : [['No sessions recorded', '-', '-']],
        foot: data.avg !== null ? [['Overall', data.logs.length, `${data.avg}%`]] : undefined,
        headStyles: { fillColor: [124, 58, 237] }, footStyles: { fillColor: [241, 245, 249], textColor: 20 },
      });
      after();

      section('Developmental Milestones');
      autoTable(pdf, {
        startY: y, head: [['Date', 'Age category', 'Overall']],
        body: data.miles.length
          ? data.miles.map((m: any) => [m.timestamp.slice(0, 10), m.ageCategory, `${Math.round(m.overallPercentage || 0)}%`])
          : [['No milestone checks in this period', '-', '-']],
        headStyles: { fillColor: [124, 58, 237] },
      });
      after();

      for (const record of data.miles) {
        if (y > 240) { pdf.addPage(); y = 20; }
        section(`${record.ageCategory} - ${record.timestamp.slice(0, 10)}`);
        const items = (record.sections || []).flatMap((area: any) =>
          (area.items || []).map((item: any) => [area.title, item.text, item.checked ? 'Achieved' : 'Pending'])
        );
        const flags = (record.redFlags || []).filter((flag: any) => flag.checked)
          .map((flag: any) => ['Warning signs', flag.text, 'Observed']);
        autoTable(pdf, {
          startY: y, head: [['Category', 'Checklist item', 'Status']],
          body: [...items, ...flags],
          headStyles: { fillColor: [124, 58, 237] },
          styles: { fontSize: 9 }, columnStyles: { 1: { cellWidth: 110 } },
        });
        after();
      }

      section('Education Plan Goals');
      const goals = data.plans.flatMap((p: any) => (p.goals || []).map((g: any) => [g.area, g.goal, g.status, g.reviewDate || '-']));
      autoTable(pdf, {
        startY: y, head: [['Area', 'Goal', 'Status', 'Review']],
        body: goals.length ? goals : [['No education plan on file', '', '', '']],
        headStyles: { fillColor: [124, 58, 237] },
      });
      after();

      if (comment.trim()) {
        if (y > 240) { pdf.addPage(); y = 20; }
        section('Teacher Comment');
        const lines = pdf.splitTextToSize(comment.trim(), 180);
        pdf.setFontSize(10); pdf.text(lines, 14, y + 4);
        y += lines.length * 5 + 12;
      }
      if (y > 250) { pdf.addPage(); y = 20; }
      pdf.line(14, y + 14, 80, y + 14); pdf.line(120, y + 14, 186, y + 14);
      pdf.setFontSize(8); pdf.text('Class teacher', 14, y + 18); pdf.text('Parent / guardian', 120, y + 18);
      pdf.text(`Generated ${new Date().toLocaleDateString()}`, 14, 288);

      pdf.save(`Term_Report_${student.fullName.replace(/\s+/g, '_')}_${to}.pdf`);
    } catch (e) {
      notify('error', 'Could not generate report.');
    } finally { setBusy(false); }
  };

  return (
    <div className="management-page">
      <div className="management-page-header">
        <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950 dark:text-white md:text-lg">
          <FileText size={22} className="text-slate-500 dark:text-slate-400" /> Term Reports
        </h1>
        <p className="mt-1 text-xs text-slate-500">Build a printable PDF from task analysis, milestones, education plan and attendance.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
        <select className={inputCls + ' sm:col-span-3'} value={studentId} onChange={e => setStudentId(e.target.value)}>
          <option value="">Select student</option>
          {students.map((s: any) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
        <input type="date" className={inputCls} value={from} onChange={e => setFrom(e.target.value)} />
        <input type="date" className={inputCls} value={to} onChange={e => setTo(e.target.value)} />
        <div />
        <textarea className={inputCls + ' sm:col-span-3'} rows={3} placeholder="Teacher comment (optional)" value={comment} onChange={e => setComment(e.target.value)} />
      </div>
      {data && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Sessions', data.logs.length],
            ['Avg independence', data.avg === null ? '-' : `${data.avg}%`],
            ['Milestone checks', data.miles.length],
            ['Attendance', data.att ? `${data.att.length} days` : 'n/a'],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{k}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{v}</p>
            </div>
          ))}
        </div>
      )}
      <button disabled={!student || busy} onClick={generate}
        className="flex items-center gap-2 rounded-md bg-slate-950 dark:bg-white dark:text-slate-950 px-5 py-3 text-xs font-semibold text-white disabled:opacity-40">
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download PDF
      </button>
    </div>
  );
};
