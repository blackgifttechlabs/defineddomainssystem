
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Users, Activity, HeartPulse, ShoppingCart, 
  ChevronRight, TrendingUp,
  ShieldAlert, Package,
  UserPlus, BellRing, Settings, Send, Receipt,
  CalendarDays
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ActionCard = ({ label, icon: Icon, onClick, tone, iconTone }: any) => (
  <button 
    onClick={onClick}
    className={`group flex w-full flex-col items-center justify-center rounded-xl border p-3 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${tone}`}
  >
    <div className={`mb-2 rounded-lg p-2 transition-transform group-hover:scale-110 ${iconTone}`}>
      <Icon size={18} />
    </div>
    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-400 leading-tight">{label}</span>
  </button>
);

const StatBox = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-slate-900 gh-box p-5 flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-3xl font-black mt-2 text-ghText dark:text-white font-mono tracking-tighter">{value}</h3>
      </div>
      <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-ghBorder dark:border-slate-700 ${color} group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm`}>
        <Icon size={22} />
      </div>
    </div>
    <p className="relative z-10 mt-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">Live database total</p>
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      <Icon size={120} />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { students, staff, clinicalLogs, setActiveTab, orders, applications, notices, systemLogs } = useStore();
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');

  const processedGraphData = useMemo(() => {
    const days = chartRange === '7d' ? 7 : 30;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const count = (clinicalLogs || []).filter(log => log.date.startsWith(dateStr)).length;
      
      data.push({
        name: d.toLocaleDateString(undefined, { 
          weekday: days === 7 ? 'short' : undefined, 
          day: 'numeric', 
          month: days === 30 ? 'short' : undefined 
        }),
        sessions: count,
        fullDate: dateStr
      });
    }
    return data;
  }, [clinicalLogs, chartRange]);

  const procurementTotal = useMemo(
    () => orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
    [orders]
  );
  const systemErrorCount = useMemo(
    () => systemLogs.filter(log => /error|fail/i.test(`${log.action} ${log.details}`)).length,
    [systemLogs]
  );

  return (
    <div className="w-full space-y-5 px-4 py-4 pb-20 animate-fade-up sm:px-6 sm:py-6 md:space-y-7 lg:px-8">
      <section className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <ActionCard label="Add Student" icon={UserPlus} tone="border-blue-200 bg-blue-50/80 dark:border-blue-900 dark:bg-blue-950/25" iconTone="bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300" onClick={() => setActiveTab('students')} />
          <ActionCard label="Add Staff" icon={Users} tone="border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/25" iconTone="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300" onClick={() => setActiveTab('staff')} />
          <ActionCard label="Checklist" icon={HeartPulse} tone="border-rose-200 bg-rose-50/80 dark:border-rose-900 dark:bg-rose-950/25" iconTone="bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300" onClick={() => setActiveTab('clinical')} />
          <ActionCard label="Announce" icon={BellRing} tone="border-violet-200 bg-violet-50/80 dark:border-violet-900 dark:bg-violet-950/25" iconTone="bg-violet-100 text-violet-600 dark:bg-violet-900/60 dark:text-violet-300" onClick={() => setActiveTab('notices')} />
          <ActionCard label="Orders" icon={Receipt} tone="border-orange-200 bg-orange-50/80 dark:border-orange-900 dark:bg-orange-950/25" iconTone="bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-300" onClick={() => setActiveTab('orders')} />
          <ActionCard label="Uniforms" icon={ShoppingCart} tone="border-fuchsia-200 bg-fuchsia-50/80 dark:border-fuchsia-900 dark:bg-fuchsia-950/25" iconTone="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/60 dark:text-fuchsia-300" onClick={() => setActiveTab('shop')} />
          <ActionCard label="Logs" icon={ShieldAlert} tone="border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70" iconTone="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200" onClick={() => setActiveTab('system-logs')} />
          <ActionCard label="Settings" icon={Settings} tone="border-indigo-200 bg-indigo-50/80 dark:border-indigo-900 dark:bg-indigo-950/25" iconTone="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-300" onClick={() => setActiveTab('settings')} />
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox title="Enrolled Students" value={students.length} icon={Users} color="text-googleBlue" />
        <StatBox title="Session Notes" value={clinicalLogs.length} icon={Activity} color="text-indigo-600" />
        <StatBox title="Active Staff" value={staff.length} icon={ShieldAlert} color="text-emerald-600" />
        <StatBox title="Procurement" value={`$${procurementTotal.toLocaleString()}`} icon={Package} color="text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col overflow-hidden rounded-[9px] border border-ghBorder bg-white shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="p-6 border-b border-ghBorder dark:border-slate-800 bg-ghBg/50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={18} className="text-googleBlue" />
              <h3 className="text-sm font-black uppercase tracking-widest text-ghText dark:text-white">Activity Growth</h3>
            </div>
            
            <div className="flex items-center bg-ghBg dark:bg-slate-800 p-1 rounded-xl border border-ghBorder dark:border-slate-700">
               <button 
                onClick={() => setChartRange('7d')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartRange === '7d' ? 'bg-white dark:bg-slate-700 text-googleBlue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <CalendarDays size={14} /> 7 Days
               </button>
               <button 
                onClick={() => setChartRange('30d')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${chartRange === '30d' ? 'bg-white dark:bg-slate-700 text-googleBlue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <CalendarDays size={14} /> 30 Days
               </button>
            </div>
          </div>
          
          <div className="p-8 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedGraphData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d0d7de33" />
                <XAxis 
                  dataKey="name" 
                  stroke="#57606a" 
                  fontSize={10} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontWeight: 800 }} 
                  interval={chartRange === '30d' ? 4 : 0}
                />
                <YAxis stroke="#57606a" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 800 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }} 
                  labelClassName="text-googleBlue"
                />
                <Area type="monotone" dataKey="sessions" stroke="#1a73e8" strokeWidth={3} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-ghBorder dark:border-slate-800 flex flex-col shadow-sm rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-ghBorder dark:border-slate-800 bg-ghBg/50 dark:bg-slate-950/50">
              <h3 className="text-sm font-black uppercase tracking-widest dark:text-white">Recent Updates</h3>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Careers', value: applications.filter(a => a.status === 'Pending').length, icon: Send, color: 'text-amber-500', tab: 'applications' },
                { label: 'Unpaid Orders', value: orders.filter(o => o.status === 'Uncollected').length, icon: Receipt, color: 'text-blue-500', tab: 'orders' },
                { label: 'Notices', value: notices.length, icon: BellRing, color: 'text-emerald-500', tab: 'notices' },
                { label: 'System Errors', value: systemErrorCount, icon: ShieldAlert, color: 'text-rose-500', tab: 'system-logs' },
              ].map((log, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveTab(log.tab)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-ghBorder dark:border-slate-800 hover:bg-ghBg dark:hover:bg-slate-800 transition-all group shadow-sm active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-slate-50 dark:bg-slate-950 border border-ghBorder dark:border-slate-800 rounded-lg group-hover:scale-110 transition-transform ${log.color}`}>
                      <log.icon size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{log.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{log.value}</span>
                     <ChevronRight size={12} className="text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
