
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { Application } from '../types';
import { Mail, FileText, CheckCircle2, XCircle, ChevronRight, Briefcase, Search, Calendar, X } from 'lucide-react';

export const ApplicationsManagement: React.FC = () => {
  const { applications, updateApplicationStatus } = useStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Shortlisted' | 'Rejected'>('All');

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Shortlisted': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-600 border-rose-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const downloadCV = (base64: string, name: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = name || 'CV_Defined Domain.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-5 px-4 py-4 animate-in fade-in duration-700 sm:px-6 sm:py-6 md:space-y-7 lg:px-8">
      <header className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">Job applications</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{filteredApps.length} {filteredApps.length === 1 ? 'candidate' : 'candidates'}</p>
        </div>
        <div className="flex gap-2 sm:justify-end">
          <div className="relative group w-full min-w-0 sm:min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search applicants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium outline-none dark:border-slate-800 dark:bg-slate-900 sm:px-4"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:hidden">
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {filteredApps.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Briefcase size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No applications found</p>
              <p className="mt-1 text-xs text-slate-400">Try another name or status.</p>
            </div>
          ) : filteredApps.map(app => (
            <button key={app.id} type="button" onClick={() => setSelectedApp(app)} className="flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{app.fullName[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{app.fullName}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusColor(app.status)}`}>{app.status}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{app.position}</p>
                <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-slate-400">
                  <span className="truncate">{app.email}</span><span>·</span><span className="shrink-0">{new Date(app.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight size={17} className="shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApps.length === 0 ? (
            <div className="col-span-full rounded-[9px] border border-dashed border-slate-200 bg-slate-50 py-20 text-center dark:border-slate-800 dark:bg-slate-900/50">
              <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No applications found in the current node.</p>
            </div>
          ) : filteredApps.map(app => (
            <div 
              key={app.id} 
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm transition-all hover:shadow-xl group cursor-pointer ${selectedApp?.id === app.id ? 'ring-4 ring-blue-500/20 border-blue-500' : 'border-slate-100 dark:border-slate-800'}`}
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[#002D50] dark:text-white flex items-center justify-center font-black text-xl uppercase border border-slate-100 dark:border-slate-700">
                  {app.fullName[0]}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>
              </div>
              <h3 className="font-black text-base dark:text-white uppercase tracking-tight mb-1 truncate">{app.fullName}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6">{app.position}</p>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Mail size={14} className="text-slate-300" /> <span className="truncate">{app.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Calendar size={14} className="text-slate-300" /> <span>{new Date(app.timestamp).toLocaleDateString()}</span>
                 </div>
              </div>

              <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={(e) => { e.stopPropagation(); downloadCV(app.cvBase64!, app.cvName!); }}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                   <FileText size={14} /> Download CV
                </button>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <ChevronRight size={16} />
                </div>
              </div>
            </div>
          ))}
      </div>

      {selectedApp && createPortal((
        <div className="fixed inset-0 z-[800] flex justify-end bg-white dark:bg-slate-950 md:bg-slate-950/60 md:backdrop-blur-sm">
           <div className="absolute inset-0 hidden md:block" onClick={() => setSelectedApp(null)} />
           <aside className="relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-slate-950 md:w-[60%] md:border-l md:border-slate-200 md:shadow-2xl lg:w-[45%] dark:md:border-slate-800">
              <header className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6 sm:py-4">
                 <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold uppercase text-white dark:bg-white dark:text-slate-950 sm:h-12 sm:w-12">
                       {selectedApp.fullName[0]}
                    </div>
                    <div className="min-w-0">
                       <h2 className="truncate text-sm font-semibold text-slate-950 dark:text-white sm:text-base">{selectedApp.fullName}</h2>
                       <div className="mt-1 flex items-center gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${getStatusColor(selectedApp.status)}`}>{selectedApp.status}</span>
                          <span className="truncate text-[10px] text-slate-400">{new Date(selectedApp.timestamp).toLocaleDateString()}</span>
                       </div>
                    </div>
                 </div>
                 <button aria-label="Close applicant details" onClick={() => setSelectedApp(null)} className="grid h-9 w-9 shrink-0 place-items-center text-slate-500 transition hover:text-slate-950 dark:hover:text-white"><X size={21} /></button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 sm:p-6 md:p-10 md:space-y-12">
                 <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Candidate Information</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                       <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-1">Applied Position</p>
                          <p className="text-sm font-black uppercase tracking-tight">{selectedApp.position}</p>
                       </div>
                       <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-1">Phone Contact</p>
                          <p className="text-sm font-black uppercase tracking-tight">{selectedApp.phone}</p>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Cover Letter</h3>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 sm:p-6">
                       "{selectedApp.coverLetter}"
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Attachments</h3>
                    <div className="flex flex-col gap-4 rounded-xl bg-slate-950 p-4 text-white sm:flex-row sm:items-center sm:justify-between sm:p-5">
                       <div className="flex items-center gap-4">
                          <FileText size={28} />
                          <div>
                             <p className="text-xs font-black uppercase tracking-widest">{selectedApp.cvName || 'Curriculum Vitae'}</p>
                             <p className="text-[9px] font-mono opacity-60">Base64 Binary Document</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => downloadCV(selectedApp.cvBase64!, selectedApp.cvName!)}
                        className="px-6 py-2.5 bg-white text-[#002D50] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-50"
                       >
                          Download CV
                       </button>
                    </div>
                 </section>
              </div>

              <footer className="flex shrink-0 gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:p-4">
                 <button 
                  onClick={() => updateApplicationStatus(selectedApp.id, 'Shortlisted')}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white transition hover:bg-emerald-700"
                 >
                    <CheckCircle2 size={16} /> Shortlist Candidate
                 </button>
                 <button 
                  onClick={() => updateApplicationStatus(selectedApp.id, 'Rejected')}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-rose-600 px-3 text-xs font-medium text-white transition hover:bg-rose-700"
                 >
                    <XCircle size={16} /> Reject Application
                 </button>
              </footer>
           </aside>
        </div>
      ), document.body)}
    </div>
  );
};
