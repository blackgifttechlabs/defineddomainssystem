import React, { useMemo, useState } from 'react';
import { ArrowLeft, MessageCircle, Plus, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import { MessageThread } from '../types';
import { useI18n } from '../utils/i18n';

const fmt = (ts: string) =>
  new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const Messages: React.FC = () => {
  const { user, students, parents, staff, messageThreads, startThread, replyToThread, markThreadRead, notify } = useStore();
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [reply, setReply] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const isAdmin = user?.role === 'SUPER_ADMIN';

  const threads = useMemo(() => {
    if (!user) return [];
    return messageThreads.filter(th => isAdmin || th.parentUserId === user.id || th.staffUserId === user.id);
  }, [messageThreads, user, isAdmin]);

  // Students the current user may start a conversation about.
  const candidates = useMemo(() => {
    if (!user) return [];
    if (user.role === 'PARENT') {
      const parent = parents.find(p => p.firebaseUid === user.id);
      return students.filter(s => s.id === parent?.studentId);
    }
    if (isAdmin) return students;
    const me = staff.find(s => s.firebaseUid === user.id || s.id === user.id);
    return students.filter(s => me && s.assignedStaffId === me.id);
  }, [user, students, parents, staff, isAdmin]);

  const selected = threads.find(th => th.id === selectedId) || null;

  const open = (th: MessageThread) => {
    setSelectedId(th.id);
    if (user && !th.readBy?.includes(user.id)) markThreadRead(th.id);
  };

  const send = async () => {
    if (!user) return;
    const student = candidates.find(s => s.id === studentId);
    if (!student || !subject.trim() || !body.trim()) {
      notify('info', 'Choose a student and write a subject and message.');
      return;
    }
    let parentUserId: string;
    let parentName: string;
    let staffUserId: string;
    let staffName: string;
    if (user.role === 'PARENT') {
      const teacher = staff.find(s => s.id === student.assignedStaffId);
      if (!teacher) { notify('error', 'This student has no assigned teacher yet.'); return; }
      parentUserId = user.id; parentName = user.name;
      staffUserId = teacher.firebaseUid || teacher.id; staffName = teacher.fullName;
    } else {
      const parent = parents.find(p => p.studentId === student.id);
      if (!parent) { notify('error', 'No parent account is linked to this student.'); return; }
      parentUserId = parent.firebaseUid; parentName = parent.name;
      staffUserId = user.id; staffName = user.name;
    }
    await startThread(
      { subject: subject.trim(), studentId: student.id, studentName: student.fullName, parentUserId, parentName, staffUserId, staffName },
      body.trim()
    );
    setComposing(false); setSubject(''); setBody(''); setStudentId('');
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    await replyToThread(selected.id, reply.trim());
    setReply('');
  };

  const card = 'rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]';
  const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#7c3aed]';

  return (
    <div className="space-y-4 pb-2">
      <header className="pr-12 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#22c55e]">{user?.role === 'PARENT' ? 'Parent portal' : 'School'}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{t('messages.title')}</h1>
          <p className="mt-1 text-[11px] font-bold text-slate-500">{t('messages.subtitle')}</p>
        </div>
        {!selected && !composing && candidates.length > 0 && (
          <button onClick={() => setComposing(true)} className="shrink-0 h-10 rounded-full bg-[#7c3aed] px-4 text-[11px] font-black text-white flex items-center gap-1.5">
            <Plus size={14} /> {t('messages.new')}
          </button>
        )}
      </header>

      {composing && (
        <section className={`${card} space-y-3`}>
          <select value={studentId} onChange={e => setStudentId(e.target.value)} className={input}>
            <option value="">Select student...</option>
            {candidates.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </select>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className={input} />
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Write your message..." className={input} />
          <div className="flex gap-2">
            <button onClick={send} className="h-10 flex-1 rounded-full bg-[#7c3aed] text-[11px] font-black text-white">{t('messages.send')}</button>
            <button onClick={() => setComposing(false)} className="h-10 rounded-full border border-slate-200 px-4 text-[11px] font-black text-slate-600">Cancel</button>
          </div>
        </section>
      )}

      {selected ? (
        <section className={`${card} space-y-3`}>
          <button onClick={() => setSelectedId(null)} className="flex items-center gap-1 text-[11px] font-black text-slate-500">
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <p className="text-sm font-black text-slate-950">{selected.subject}</p>
            <p className="text-[10px] font-bold text-slate-500">{selected.studentName} · {selected.parentName} &amp; {selected.staffName}</p>
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {selected.messages.map(m => {
              const mine = m.senderId === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'bg-[#7c3aed] text-white' : 'bg-slate-100 text-slate-900'}`}>
                    <p className="text-xs font-bold whitespace-pre-wrap break-words">{m.message}</p>
                    <p className={`mt-1 text-[9px] font-bold ${mine ? 'text-white/70' : 'text-slate-500'}`}>{m.senderName} · {fmt(m.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} placeholder="Reply..." className={input} />
            <button onClick={sendReply} aria-label={t('messages.send')} className="h-9 w-9 shrink-0 rounded-full bg-[#7c3aed] text-white grid place-items-center">
              <Send size={14} />
            </button>
          </div>
        </section>
      ) : threads.length === 0 ? (
        <section className={`${card} text-center p-6`}>
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-400 grid place-items-center"><MessageCircle size={18} /></div>
          <p className="mt-4 text-sm font-black">{t('messages.empty')}</p>
        </section>
      ) : (
        <section className="space-y-2">
          {threads.map(th => {
            const last = th.messages[th.messages.length - 1];
            const unread = !!user && !th.readBy?.includes(user.id);
            return (
              <button key={th.id} onClick={() => open(th)} className="w-full rounded-[20px] border border-slate-200 bg-white p-3 text-left flex items-center gap-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#f2e8ff] text-[#7c3aed] grid place-items-center"><MessageCircle size={16} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-black text-slate-950">{th.subject}</p>
                    {unread && <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-black uppercase text-emerald-700">New</span>}
                  </div>
                  <p className="truncate text-[11px] font-bold text-slate-500">{th.studentName} · {last?.message}</p>
                </div>
                <span className="shrink-0 text-[9px] font-bold text-slate-400">{fmt(th.lastMessageAt)}</span>
              </button>
            );
          })}
        </section>
      )}
    </div>
  );
};
