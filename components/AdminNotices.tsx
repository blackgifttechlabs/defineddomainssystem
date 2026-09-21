
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { Send, MessageSquare, Bell, ChevronRight, X, Clock, DollarSign, Sparkles, Loader2, CheckCircle2, Calendar, Search, History, Plus } from 'lucide-react';
import { Notice, NoticeType, NoticeTarget } from '../types';

export const AdminNotices: React.FC = () => {
  const { addNotice, user, replyToNotice, students, settings, notify } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NoticeType>('General');
  const [target, setTarget] = useState<NoticeTarget>('ALL');
  const [isSending, setIsSending] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyNotices, setHistoryNotices] = useState<Notice[]>([]);

  const studentsWithBalance = useMemo(() => {
    return students.filter(s => (s.totalPaid || 0) < settings.feesAmount);
  }, [students, settings]);

  const filteredNotices = useMemo(() => {
    return historyNotices.filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [historyNotices, searchTerm]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsSending(true);
    try {
      await addNotice(title, content, type, target);
      notify('success', 'Message posted successfully.');
      setTitle('');
      setContent('');
      setIsComposerOpen(false);
    } catch (err) {
      notify('error', 'Failed to post message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateDraft = () => {
    if (studentsWithBalance.length === 0) {
      notify('info', 'No unpaid balances found.');
      return;
    }
    setTitle('Tuition Fee Reminder');
    setContent(`Hello parents. We found ${studentsWithBalance.length} accounts that still need to pay school fees. Please visit the office soon to update your child's record. Thank you.`);
    setType('Fees');
    setTarget('PARENT');
    setIsComposerOpen(true);
    notify('success', 'Fee reminder draft created.');
  };

  const handleGenerateMeetingDraft = (group: 'Staff' | 'Teachers') => {
    const isTeachers = group === 'Teachers';
    setTitle(`${group} Meeting Notification`);
    setContent(`All ${group} members must attend a meeting tomorrow morning at 08:00 AM. We will talk about school plans and the new term.`);
    setType('Meeting');
    setTarget(isTeachers ? 'SPECIALIST' : 'ADMIN_SUPPORT');
    setIsComposerOpen(true);
    notify('success', `${group} meeting draft created.`);
  };

  const handleReply = async () => {
    if (!replyText || !selectedNotice) return;
    await replyToNotice(selectedNotice.id, replyText);
    setReplyText('');
  };

  const openHistory = async () => {
    if (isHistoryOpen) {
      setIsHistoryOpen(false);
      return;
    }

    setIsHistoryOpen(true);
    setIsHistoryLoading(true);
    try {
      const snapshot = await getDocs(query(collection(getFirestore(), 'notices'), orderBy('timestamp', 'desc')));
      setHistoryNotices(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as Notice)));
      window.setTimeout(() => document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' }), 0);
    } catch {
      notify('error', 'Failed to load announcement history.');
      setIsHistoryOpen(false);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 px-4 py-4 pb-20 animate-in fade-in duration-700 selection:bg-blue-100 selection:text-blue-900 sm:px-6 sm:py-6 md:space-y-7 lg:px-8">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => setIsComposerOpen(true)}
          className="flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Plus size={15} /> Add announcement
        </button>
        <button 
          onClick={openHistory}
          disabled={isHistoryLoading}
          className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          {isHistoryLoading ? <Loader2 size={15} className="animate-spin" /> : <History size={15} />} {isHistoryOpen ? 'Hide history' : 'View history'}
        </button>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Form Area */}
        {isComposerOpen && (
        <div className="lg:col-span-8">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800 sm:px-6 sm:py-4">
               <div>
                 <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950 dark:text-white">
                   <MessageSquare size={14} className="text-googleBlue" /> New Announcement
                 </h3>
                 <p className="mt-1 text-xs text-slate-500">Share an update with your school community.</p>
               </div>
               <button type="button" aria-label="Close announcement composer" onClick={() => setIsComposerOpen(false)} className="grid h-8 w-8 shrink-0 place-items-center text-slate-400 transition hover:text-slate-950 dark:hover:text-white">
                 <X size={18} />
               </button>
            </div>
            
            <form onSubmit={handleSend} className="space-y-5 p-4 sm:p-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Message title</label>
                <input 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Enter a subject line..." 
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Notice type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value as any)} 
                    className="h-10 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="General">General News</option>
                    <option value="Fees">Tuition & Fees</option>
                    <option value="Meeting">Meeting Alert</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Audience</label>
                  <select 
                    value={target} 
                    onChange={e => setTarget(e.target.value as any)} 
                    className="h-10 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="PARENT">Parents Only</option>
                    <option value="SPECIALIST">Teachers Only</option>
                    <option value="ADMIN_SUPPORT">Support Staff Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Message content</label>
                <textarea 
                  required 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  placeholder="Type your announcement details here..." 
                  rows={5} 
                  className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSending} 
                className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 sm:w-auto"
              >
                {isSending ? <Loader2 className="animate-spin" size={17} /> : <><Send size={16} /> Post announcement</>}
              </button>
            </form>
          </div>
        </div>
        )}

        {/* Sidebar Tools Area */}
        <div className={`${isComposerOpen ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-6`}>
          <div className="h-full space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <header>
               <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Helper Tools</h3>
               </div>
               <h4 className="text-base font-semibold text-slate-900 dark:text-white">Quick drafts</h4>
            </header>

            <div className={`grid gap-2 sm:grid-cols-3 ${isComposerOpen ? 'lg:grid-cols-1' : 'lg:grid-cols-3'}`}>
              <button 
                onClick={handleGenerateDraft} 
                className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
              >
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-none group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight dark:text-white">Fee Reminder</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">{studentsWithBalance.length} unpaid nodes</p>
                </div>
              </button>

              <button 
                onClick={() => handleGenerateMeetingDraft('Teachers')} 
                className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
              >
                <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-none group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight dark:text-white">Teacher Meeting</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Registry coordination</p>
                </div>
              </button>

              <button 
                onClick={() => handleGenerateMeetingDraft('Staff')} 
                className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
              >
                <div className="p-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-none group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight dark:text-white">Staff Update</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Admin support draft</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      {isHistoryOpen && (
      <section id="history-section" className="space-y-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:space-y-6 sm:pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
          <div className="flex items-center gap-3">
             <History size={18} className="text-googleBlue" />
             <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Message Registry</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter history..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none text-[10px] font-black uppercase tracking-widest outline-none focus:border-googleBlue transition-all"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
           <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
              {filteredNotices.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Bell size={28} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No messages found</p>
                </div>
              ) : filteredNotices.map(notice => (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => setSelectedNotice(notice)}
                  className="flex w-full min-w-0 items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <MessageSquare size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{notice.title}</p>
                      <span className="shrink-0 text-[10px] text-slate-400">{new Date(notice.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{notice.content}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{notice.target}</span>
                      <span>{notice.type}</span>
                      <span>·</span>
                      <span>{notice.replies?.length || 0} replies</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="mt-3 shrink-0 text-slate-400" />
                </button>
              ))}
           </div>
           <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                       <th className="px-8 py-5">Subject / content</th>
                       <th className="px-8 py-5">Audience</th>
                       <th className="px-8 py-5">Category</th>
                       <th className="px-8 py-5 text-center">Replies</th>
                       <th className="px-8 py-5 text-right">Logged Date</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredNotices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <Bell size={48} className="mx-auto text-slate-200 mb-4 opacity-50" />
                           <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-widest">No matching registry entries</p>
                        </td>
                      </tr>
                    ) : filteredNotices.map(notice => (
                      <tr 
                        key={notice.id} 
                        className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 group transition-colors cursor-pointer"
                        onClick={() => setSelectedNotice(notice)}
                      >
                         <td className="px-8 py-6">
                            <p className="text-[11px] font-black uppercase tracking-tight text-slate-950 dark:text-white leading-none">{notice.title}</p>
                            <p className="text-[10px] text-slate-400 mt-2 line-clamp-1 italic">"{notice.content}"</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-none border border-slate-200 dark:border-slate-700">
                               {notice.target}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-none border ${
                              notice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                              notice.type === 'Meeting' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
                               {notice.type}
                            </span>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                               <MessageSquare size={12} className="text-slate-300" />
                               <span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-400">{notice.replies?.length || 0}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end">
                               <p className="text-[10px] font-mono font-bold text-slate-400">{new Date(notice.timestamp).toLocaleDateString()}</p>
                               <ChevronRight size={14} className="text-slate-200 mt-2 group-hover:text-googleBlue group-hover:translate-x-1 transition-all" />
                            </div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/30 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 text-slate-400">
                 <CheckCircle2 size={16} className="text-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Database Sync Active</span>
              </div>
              <p className="text-[9px] font-mono text-slate-400 uppercase">{filteredNotices.length} Total Messages Logged</p>
           </div>
        </div>
      </section>
      )}

      {/* Detail Slide-over */}
      {selectedNotice && createPortal((
        <div className="fixed inset-0 z-[800] flex justify-end bg-white dark:bg-slate-950 md:bg-slate-950/40 md:backdrop-blur-sm">
          <div className="absolute inset-0 hidden md:block" onClick={() => setSelectedNotice(null)} />
          <aside className="relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-slate-950 md:max-w-lg md:border-l md:border-slate-200 md:shadow-2xl dark:md:border-slate-800">
            <header className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6 sm:py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white sm:text-lg">Broadcast detail</h2>
                <p className="mt-0.5 text-xs text-slate-500">Announcement and replies</p>
              </div>
              <button aria-label="Close broadcast detail" onClick={() => setSelectedNotice(null)} className="grid h-9 w-9 place-items-center text-slate-500 transition hover:text-slate-950 dark:hover:text-white"><X size={21} /></button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50 p-4 sidebar-scrollbar dark:bg-slate-950 sm:p-6 sm:space-y-8">
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <span className={`mb-4 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                  selectedNotice.type === 'Fees' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                  selectedNotice.type === 'Meeting' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  'bg-slate-50 text-slate-600 border-slate-100'
                }`}>
                  {selectedNotice.type}
                </span>
                <h3 className="text-xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white sm:text-2xl">{selectedNotice.title}</h3>
                <p className="mt-4 border-l-2 border-blue-200 pl-4 text-sm leading-6 text-slate-600 dark:border-blue-900 dark:text-slate-300 sm:text-base">{selectedNotice.content}</p>
                
                <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between">
                   <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold uppercase text-white">
                        {selectedNotice.authorName[0]}
                      </div>
                      <span className="text-xs font-medium text-slate-500">By {selectedNotice.authorName}</span>
                   </div>
                   <span className="text-[10px] text-slate-400">{new Date(selectedNotice.timestamp).toLocaleString()}</span>
                </div>
              </article>

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Replies ({selectedNotice.replies?.length || 0})</h4>
                   <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 mx-4"></div>
                </div>
                
                <div className="space-y-4">
                  {selectedNotice.replies?.map((r: any, idx: number) => (
                    <div key={idx} className={`rounded-xl border p-4 transition-all sm:p-5 ${r.userId === user?.id ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-none bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-200 uppercase">{r.userName[0]}</div>
                          <div>
                             <span className="text-xs font-black dark:text-white uppercase tracking-tight">{r.userName}</span>
                             <p className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase">{new Date(r.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium pl-1 italic">"{r.message}"</p>
                    </div>
                  ))}
                  {(!selectedNotice.replies || selectedNotice.replies.length === 0) && (
                    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
                       <p className="text-xs text-slate-400">No replies yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:p-4">
              <div className="flex items-end gap-2">
                <textarea 
                  value={replyText} 
                  onChange={e => setReplyText(e.target.value)} 
                  placeholder="Type a response node..." 
                  className="min-h-10 flex-1 resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-900"
                  rows={1}
                />
                <button 
                  onClick={handleReply} 
                  disabled={!replyText} 
                  className="h-10 shrink-0 rounded-md bg-slate-950 px-4 text-xs font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  Reply
                </button>
              </div>
            </footer>
          </aside>
        </div>
      ), document.body)}
    </div>
  );
};
