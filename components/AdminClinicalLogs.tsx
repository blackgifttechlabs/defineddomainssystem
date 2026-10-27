
import { ParentReports } from './student/ParentReports';
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, 
  ChevronRight, 
  HeartPulse, 
  Calendar, 
  Activity,
  X,
  ArrowLeft,
  Clock,
  Brain,
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Target
} from 'lucide-react';
import { Student, SessionLog, MilestoneRecord } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

type TimeFilter = 'Week' | 'Month' | 'Year' | 'All';
type ReportType = 'clinical' | 'growth';

const SCHOOL_LOGO_URL = 'https://i.ibb.co/spSVqW8s/definedlogo.png';
const SCHOOL_DETAILS = {
  name: 'Defined Domain Day Services',
  address: '27 Colnebrook Lane, Harare',
  email: 'admin@defineddomain.org',
  phone: '+263 775 926 454',
  website: 'defineddomain.org',
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const loadImageDataUrl = async (src: string) => {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
};

export const AdminClinicalLogs: React.FC = () => {
  const { students, clinicalLogs, user, parents, milestoneRecords } = useStore();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportType, setReportType] = useState<ReportType>('clinical');
  const [activeLog, setActiveLog] = useState<SessionLog | null>(null);
  const [activeMilestone, setActiveMilestone] = useState<MilestoneRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const isRestrictedRole = user?.role === 'STUDENT' || user?.role === 'PARENT';

  useEffect(() => {
    if (isRestrictedRole && students.length > 0) {
      if (user?.role === 'STUDENT') {
        const student = students.find(s => s.firebaseUid === user.id);
        if (student) setSelectedStudent(student);
      } else if (user?.role === 'PARENT') {
        const parent = parents.find(p => p.firebaseUid === user.id || p.id === user.id);
        if (parent) {
          const student = students.find(s => s.id === parent.studentId);
          if (student) setSelectedStudent(student);
        }
      }
    }
  }, [user, students, parents, isRestrictedRole]);

  const studentLogs = useMemo(() => {
    if (!selectedStudent) return [];
    let logs = clinicalLogs.filter(log => log.studentId === selectedStudent.id);
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedStudent, clinicalLogs]);

  const studentMilestones = useMemo(() => {
    if (!selectedStudent) return [];
    let milestones = milestoneRecords.filter(m => m.studentId === selectedStudent.id);
    return milestones.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedStudent, milestoneRecords]);

  const handleExportPDF = async (reportLog = activeLog) => {
    if (!selectedStudent || !reportLog) return;
    setIsExporting(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const margin = 14;
      const reportRef = `DDS-REPORT-${selectedStudent.id}-${new Date(reportLog.date).getTime()}`;
      const reportDate = new Date(reportLog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

      doc.setFillColor(124, 58, 237);
      doc.rect(0, 0, pageW, 42, 'F');
      doc.setFillColor(255, 255, 255);
      doc.circle(margin + 12, 21, 12, 'F');

      try {
        const logo = await loadImageDataUrl(SCHOOL_LOGO_URL);
        if (logo) doc.addImage(logo, 'PNG', margin + 4, 13, 16, 16);
      } catch {
        // Logo is skipped only if the remote asset cannot be loaded.
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('DEFINED DOMAIN', margin + 30, 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(SCHOOL_DETAILS.name, margin + 30, 23);
      doc.text(SCHOOL_DETAILS.address, margin + 30, 29);
      doc.text(`${SCHOOL_DETAILS.email}   ${SCHOOL_DETAILS.phone}`, margin + 30, 35);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Learning Progress Report', pageW - margin, 17, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Report Ref: ${reportRef}`, pageW - margin, 25, { align: 'right' });
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - margin, 32, { align: 'right' });

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(reportLog.targetBehavior || 'Progress Report', margin, 58);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Prepared for ${selectedStudent.fullName} on ${reportDate}`, margin, 65);

      autoTable(doc, {
        startY: 76,
        theme: 'plain',
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 3.2, lineColor: [226, 232, 240], lineWidth: 0.2 },
        headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        head: [['Student Details', '']],
        body: [
          ['Student ID', selectedStudent.id],
          ['Student Name', selectedStudent.fullName],
          ['Assigned Class', selectedStudent.assignedClass || '-'],
          ['Report Date', reportDate],
          ['Method', reportLog.method],
          ['Independence Score', `${reportLog.independenceScore}%`],
        ],
        columnStyles: { 0: { fontStyle: 'bold', textColor: [71, 85, 105], cellWidth: 58 }, 1: { textColor: [15, 23, 42] } },
        margin: { left: margin, right: margin },
      });

      const summaryY = (doc as any).lastAutoTable.finalY + 9;
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(margin, summaryY, pageW - margin * 2, 22, 3, 3, 'F');
      doc.setDrawColor(16, 185, 129);
      doc.roundedRect(margin, summaryY, pageW - margin * 2, 22, 3, 3, 'S');
      doc.setTextColor(6, 95, 70);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Progress Summary', margin + 4, summaryY + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`${reportLog.steps.filter(step => step.promptLevel === '+').length} of ${reportLog.steps.length} steps achieved independently.`, margin + 4, summaryY + 15);

      autoTable(doc, {
        startY: summaryY + 31,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.2, valign: 'middle' },
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        head: [['Step', 'Description', 'Outcome']],
        body: reportLog.steps.map((step, i) => [
          (i + 1).toString().padStart(2, '0'),
          step.description,
          step.promptLevel === '+' ? 'Achieved independently' : 'Support given',
        ]),
        columnStyles: { 0: { cellWidth: 16, halign: 'center', fontStyle: 'bold' }, 2: { cellWidth: 42, fontStyle: 'bold' } },
        margin: { left: margin, right: margin },
      });

      const qrText = [
        'DEFINED DOMAIN PROGRESS REPORT',
        `Ref: ${reportRef}`,
        `Student: ${selectedStudent.fullName} (${selectedStudent.id})`,
        `Date: ${reportDate}`,
        `Skill: ${reportLog.targetBehavior}`,
        `Score: ${reportLog.independenceScore}%`,
      ].join(' | ');
      const qrDataUrl = await QRCode.toDataURL(qrText, { width: 220, margin: 1, errorCorrectionLevel: 'M' });
      const footerTop = pageH - 22;
      doc.addImage(qrDataUrl, 'PNG', pageW - margin - 27, footerTop - 34, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(124, 58, 237);
      doc.text('Scan to verify report details', pageW - margin - 13.5, footerTop - 4, { align: 'center' });

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, footerTop, pageW - margin, footerTop);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${SCHOOL_DETAILS.name} | ${SCHOOL_DETAILS.email} | ${SCHOOL_DETAILS.website}`, margin, footerTop + 5);
      doc.text(`Page 1 of 1 | ${reportRef}`, pageW - margin, footerTop + 5, { align: 'right' });

      doc.save(`Report_${selectedStudent.id}_${reportLog.id}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!selectedStudent) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-widest text-slate-400">Loading Records...</div>;

  if (isRestrictedRole) {
    return <ParentReports key={selectedStudent.id} student={selectedStudent} assessments={studentMilestones} lessons={studentLogs} onDownload={handleExportPDF} exporting={isExporting} />;
  }

  return (
    <div className="space-y-1 animate-in fade-in duration-500 pb-10 selection:bg-blue-100">
      
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-none flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 text-white">
            <HeartPulse size={20} />
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-none overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200">
                {selectedStudent.imageUrl ? (
                  <img src={selectedStudent.imageUrl} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full p-1.5 flex items-center justify-center">
                    <img src={SCHOOL_LOGO_URL} alt="" className="w-full h-full object-contain grayscale opacity-40" />
                  </div>
                )}
             </div>
             <div>
               <h1 className="text-lg font-black uppercase text-slate-900 dark:text-white leading-none tracking-tight">Report History</h1>
               <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{selectedStudent.fullName} // Records</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none p-4 space-y-1 h-fit">
           <h3 className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-4 flex items-center gap-2 px-2">
              <Calendar size={12} /> List of Reports
           </h3>
           <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
              {studentLogs.length === 0 ? (
                <p className="text-[9px] font-bold text-slate-300 text-center py-10 uppercase italic">Empty archive</p>
              ) : studentLogs.map(log => (
                <button 
                  key={log.id} 
                  onClick={() => setActiveLog(log)}
                  className={`w-full flex items-center justify-between p-4 border transition-all text-left group ${activeLog?.id === log.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-blue-600'}`}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase leading-none mb-1">{new Date(log.date).toLocaleDateString()}</p>
                    <p className={`text-[8px] font-bold uppercase truncate w-32 ${activeLog?.id === log.id ? 'text-slate-400' : 'text-slate-500'}`}>{log.targetBehavior}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black font-mono">+{log.independenceScore}%</span>
                    <ChevronRight size={12} className={activeLog?.id === log.id ? 'text-blue-400' : 'text-slate-200'} />
                  </div>
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden min-h-[500px]">
           {activeLog ? (
             <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50">
                   <div>
                      <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest">Target Skill</span>
                      <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight leading-none mt-1">{activeLog.targetBehavior}</h4>
                   </div>
                   <button onClick={() => handleExportPDF()} disabled={isExporting} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 hover:text-blue-600 transition-all">
                      {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                   </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                   {activeLog.steps.map((step, idx) => (
                     <div key={step.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                           <span className="font-mono text-[10px] font-bold text-slate-300">{(idx + 1).toString().padStart(2, '0')}</span>
                           <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{step.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 border text-[8px] font-black uppercase ${step.promptLevel === '+' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                           {step.promptLevel === '+' ? 'Achieved' : 'Help Given'}
                        </span>
                     </div>
                   ))}
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-20">
                <Brain size={64} className="mb-4 text-slate-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Select a report from the list</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
