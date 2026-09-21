
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { StudentApplication } from '../../types';
import { 
  CheckCircle2, XCircle, ChevronRight, X, Loader2, 
  ArrowLeft
} from 'lucide-react';

const WhatsAppIcon = "https://cdn-icons-png.flaticon.com/512/3670/3670051.png";
const EmailIcon = "https://cdn-icons-png.flaticon.com/512/542/542689.png";
const CallIcon = "https://i.ibb.co/1Vy4P2T/telephone-call.png";

export const StudentApplications: React.FC = () => {
  const { studentApplications, updateStudentApplicationStatus, notify } = useStore();
  const [selectedApp, setSelectedApp] = useState<StudentApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showChannelModal, setShowChannelModal] = useState(false);

  const handleUpdate = async (status: 'Approved' | 'Rejected', channel?: 'WhatsApp' | 'Email' | 'Call') => {
    if (!selectedApp) return;
    
    if (status === 'Approved' && channel) {
      const message = `Hello ${selectedApp.firstName}'s guardian,\n\nWe are happy to tell you that the application for ${selectedApp.firstName} ${selectedApp.lastName} at Defined Domain has been approved!\n\n${replyText ? `Note: ${replyText}\n\n` : ''}Please come to our office at 27 Colnebrook Lane, Harare to finish the process.\n\nBest regards,\nDefined Domain Admissions Team`;
      const subject = `Application Approved: ${selectedApp.firstName} ${selectedApp.lastName}`;

      if (channel === 'WhatsApp') {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${selectedApp.guardianPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
      } else if (channel === 'Email') {
        const mailto = `mailto:${selectedApp.guardianEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        window.location.href = mailto;
      } else if (channel === 'Call') {
        window.location.href = `tel:${selectedApp.guardianPhone}`;
      }
    }

    setIsProcessing(true);
    try {
      await updateStudentApplicationStatus(selectedApp.id, status, replyText);
      notify('success', `Application ${status.toLowerCase()} successfully.`);
      setSelectedApp(null);
      setReplyText('');
      setShowChannelModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const StatusPill = ({ status }: { status: string }) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Rejected': 'bg-rose-100 text-rose-700 border-rose-200'
    }[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${colors}`}>{status}</span>;
  };

  if (selectedApp) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-500">
        <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
           <div className="flex items-center gap-6">
              <button onClick={() => setSelectedApp(null)} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-slate-400 hover:text-black transition-all">
                <ArrowLeft size={24} />
              </button>
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">Admission Profile</h2>
                 <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Review submissions and provide enrollment next steps</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <StatusPill status={selectedApp.status} />
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 max-w-6xl mx-auto w-full space-y-6 sm:p-6 md:p-10 md:space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Student Side */}
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">Student Details</h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
                       <label className="text-[10px] font-black uppercase text-black dark:text-white block mb-2">Full Name</label>
                       <p className="text-lg font-black uppercase">{selectedApp.firstName} {selectedApp.lastName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
                          <label className="text-[10px] font-black uppercase text-black dark:text-white block mb-2">Date of Birth</label>
                          <p className="text-lg font-black font-mono">{selectedApp.dob}</p>
                       </div>
                       <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
                          <label className="text-[10px] font-black uppercase text-black dark:text-white block mb-2">Gender</label>
                          <p className="text-lg font-black uppercase">{selectedApp.gender || 'Not Set'}</p>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
                       <label className="text-[10px] font-black uppercase text-black dark:text-white block mb-2">Home Address</label>
                       <p className="text-sm font-medium italic">"{selectedApp.address}"</p>
                    </div>
                 </div>
              </div>

              {/* Guardian Side */}
              <div className="space-y-8">
                 <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white">Guardian Details</h3>
                    <div className="h-px flex-1 bg-slate-100 dark:border-slate-800"></div>
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
                       <label className="text-[10px] font-black uppercase text-black dark:text-white block mb-2">Email Address</label>
                       <p className="text-base font-bold">{selectedApp.guardianEmail}</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none">
                       <label className="text-[10px] font-black uppercase text-black dark:text-white block mb-2">WhatsApp Phone Number</label>
                       <p className="text-base font-bold uppercase">{selectedApp.guardianPhone}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Response Section */}
           <div className="space-y-6 pt-12 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Reply Message</h3>
                 <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
              </div>
              <textarea 
                 value={replyText} 
                 onChange={e => setReplyText(e.target.value)} 
                 placeholder="Type a message for the guardian..." 
                 className="w-full p-8 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-none text-base font-medium italic outline-none focus:border-blue-500 transition-all resize-none shadow-inner dark:text-white" 
                 rows={4} 
              />
           </div>
        </div>

        <footer className="p-4 sm:p-6 md:p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6">
           <button 
            onClick={() => setShowChannelModal(true)}
            className="px-16 py-6 bg-emerald-600 text-white rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-3 active:scale-95"
           >
              <CheckCircle2 size={20} /> Approve
           </button>
           <button 
            onClick={() => handleUpdate('Rejected')}
            className="px-16 py-6 bg-rose-500 text-white rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 active:scale-95"
           >
              <XCircle size={20} /> Decline
           </button>
        </footer>

        {/* Channel Selection Modal */}
        {showChannelModal && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 max-w-lg w-full p-5 sm:p-8 md:p-10 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-xl font-black uppercase text-center mb-8 dark:text-white">Notify Guardian</h3>
              <p className="text-sm text-slate-500 text-center mb-10 italic">How would you like to contact the guardian?</p>
              
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => handleUpdate('Approved', 'WhatsApp')}
                  className="flex flex-col items-center gap-4 p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-600 transition-all group"
                >
                  <img src={WhatsAppIcon} className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all" alt="WhatsApp" />
                  <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                </button>
                <button 
                  onClick={() => handleUpdate('Approved', 'Email')}
                  className="flex flex-col items-center gap-4 p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 transition-all group"
                >
                  <img src={EmailIcon} className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all" alt="Email" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                </button>
                <button 
                  onClick={() => handleUpdate('Approved', 'Call')}
                  className="flex flex-col items-center gap-4 p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-amber-500 hover:text-amber-600 transition-all group"
                >
                  <img src={CallIcon} className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all" alt="Call" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Call</span>
                </button>
              </div>

              <button 
                onClick={() => setShowChannelModal(false)}
                className="w-full mt-10 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 animate-in fade-in duration-700 sm:px-6 sm:py-6 lg:px-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">Applications</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
          {studentApplications.length} {studentApplications.length === 1 ? 'application' : 'applications'} received
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
          {studentApplications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No applications yet</p>
              <p className="mt-1 text-xs text-slate-400">New student applications will appear here.</p>
            </div>
          ) : studentApplications.map(app => (
            <button
              key={app.id}
              type="button"
              onClick={() => setSelectedApp(app)}
              className="flex w-full min-w-0 items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {app.firstName?.[0]}{app.lastName?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-950 dark:text-white">{app.firstName} {app.lastName}</p>
                  <StatusPill status={app.status} />
                </div>
                <p className="mt-1 truncate text-xs text-slate-600 dark:text-slate-400">{app.guardianEmail}</p>
                <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-slate-400">
                  <span className="truncate">{app.guardianPhone}</span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0">{new Date(app.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight size={17} className="mt-3 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/50 text-[10px] font-black uppercase tracking-widest text-black dark:text-white border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-10 py-6">Student Name</th>
                <th className="px-8 py-6">Contact Info</th>
                <th className="px-8 py-6">Date Received</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-10 py-6 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {studentApplications.length === 0 ? (
                <tr><td colSpan={5} className="py-24 text-center text-xs font-bold text-slate-300 uppercase tracking-widest italic">No applications found.</td></tr>
              ) : studentApplications.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 cursor-pointer group transition-colors" onClick={() => setSelectedApp(app)}>
                  <td className="px-10 py-6">
                    <p className="text-[13px] font-black uppercase tracking-tight text-black dark:text-white leading-none">{app.firstName} {app.lastName}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase">Born: {app.dob}</p>
                       <span className="text-[8px] text-slate-300">•</span>
                       <p className="text-[9px] font-black text-slate-400 uppercase">{app.gender}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{app.guardianEmail}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-1">{app.guardianPhone}</p>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-slate-500 font-mono uppercase">{new Date(app.timestamp).toLocaleDateString()}</td>
                  <td className="px-8 py-6"><StatusPill status={app.status} /></td>
                  <td className="px-10 py-6 text-right">
                    <button className="p-3 rounded-none bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-black group-hover:text-white transition-all"><ChevronRight size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
