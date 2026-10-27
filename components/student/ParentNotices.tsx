import React, { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ParentNotices: React.FC = () => {
  const { notices, user, markNoticeAsViewed, setActiveTab } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const available = notices.filter(n => (n.target === 'ALL' || n.target === user?.role) && (!n.recipientUserId || n.recipientUserId === user?.id)).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const selected = available.find(n => n.id === selectedId);
  if (selected) return <div className="space-y-6">
    <button onClick={() => setSelectedId(null)} className="flex min-h-11 items-center gap-2 text-sm text-neutral-600"><ArrowLeft size={17} />Notices</button>
    <header><h1 className="text-2xl font-semibold tracking-tight">{selected.title}</h1><p className="mt-2 text-sm text-neutral-500">{new Date(selected.timestamp).toLocaleDateString()}</p></header>
    <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-neutral-700">{selected.content}</p>
    {selected.type === 'Record' && <button className="parent-primary" onClick={() => setActiveTab('clinical-history')}>View reports</button>}
    {!!selected.replies?.length && <section className="max-w-3xl space-y-4 border-t border-neutral-200 pt-5"><h2 className="text-base font-semibold">Replies</h2>{selected.replies.map(reply => <div key={reply.id}><p className="text-sm font-medium">{reply.userName}</p><p className="mt-1 text-sm text-neutral-600">{reply.message}</p></div>)}</section>}
  </div>;
  return <div className="space-y-6">
    <h1 className="text-2xl font-semibold tracking-tight">Notices</h1>
    <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
      {available.length ? available.map(notice => {
        const unread = !notice.views?.some(v => v.userId === user?.id);
        return <button key={notice.id} onClick={() => { setSelectedId(notice.id); if (unread) markNoticeAsViewed(notice.id); }} className="flex w-full items-center gap-3 p-4 text-left hover:bg-neutral-50">
          <span className={`h-2 w-2 shrink-0 rounded-full ${unread ? 'bg-[#3b1764]' : 'bg-neutral-200'}`} aria-label={unread ? 'Unread' : 'Read'} />
          <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{notice.title}</span><span className="mt-1 block text-xs text-neutral-500">{new Date(notice.timestamp).toLocaleDateString()}</span></span><ChevronRight size={17} className="text-neutral-400" />
        </button>;
      }) : <p className="p-8 text-sm text-neutral-500">No notices yet.</p>}
    </div>
  </div>;
};
