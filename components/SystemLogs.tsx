
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { ShieldAlert, Search, Clock, User, ArrowLeft, Terminal, Database } from 'lucide-react';

export const SystemLogs: React.FC = () => {
  const { systemLogs, setActiveTab } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const filteredLogs = useMemo(() => {
    return systemLogs.filter(log => {
      const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = filterAction === 'All' || log.action === filterAction;
      return matchesSearch && matchesAction;
    });
  }, [systemLogs, searchTerm, filterAction]);

  // Fix: Explicitly type the Set as Set<string> to ensure correct array inference
  const uniqueActions = useMemo<string[]>(() => {
    const actions = new Set<string>(systemLogs.map(l => l.action));
    return ['All', ...Array.from(actions)];
  }, [systemLogs]);

  return (
    <div className="w-full space-y-5 px-4 py-4 pb-20 animate-in fade-in duration-700 sm:px-6 sm:py-6 md:space-y-7 lg:px-8">
      <header className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">Audit logs</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{filteredLogs.length} recorded {filteredLogs.length === 1 ? 'event' : 'events'}</p>
        </div>

        <div className="flex gap-2 sm:justify-end">
          <div className="relative group w-full min-w-0 sm:min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-800 dark:bg-slate-900"
            />
          </div>
          <select 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
            className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium outline-none dark:border-slate-800 dark:bg-slate-900"
          >
            {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-0 md:p-8">
           <div className="hidden md:grid grid-cols-12 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="col-span-3">Date & Time</div>
              <div className="col-span-2">User</div>
              <div className="col-span-2">Action Type</div>
              <div className="col-span-5">Activity Details</div>
           </div>
           
           <div className="divide-y divide-slate-200 dark:divide-slate-800 md:divide-slate-50 md:dark:divide-slate-800">
              {filteredLogs.length === 0 ? (
                <div className="py-24 text-center">
                  <Terminal size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-[10px] font-black uppercase text-slate-300">No logs found.</p>
                </div>
              ) : filteredLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-1 items-center gap-2 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 md:grid-cols-12 md:gap-4 md:p-0 md:py-6">
                   <div className="col-span-1 md:col-span-3">
                      <div className="flex items-center gap-3">
                         <Clock size={14} className="text-blue-500 md:hidden" />
                         <p className="text-[11px] font-bold dark:text-white">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                   </div>
                   
                   <div className="col-span-1 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <User size={12} className="text-slate-300" />
                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{log.userName}</span>
                      </div>
                   </div>

                   <div className="col-span-1 md:col-span-2">
                      <span className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase border border-slate-100 dark:border-slate-700 text-blue-600">
                         {log.action}
                      </span>
                   </div>

                   <div className="col-span-1 md:col-span-5">
                      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                         {log.details}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50 sm:p-6 md:p-8">
           <div className="flex items-center gap-4 text-slate-400">
              <Database size={18} className="text-blue-500" />
              <p className="text-[9px] font-black uppercase tracking-widest">Official Audit Record</p>
           </div>
           <p className="text-[9px] font-mono text-slate-400 uppercase">{filteredLogs.length} Entries</p>
        </div>
      </div>
    </div>
  );
};
