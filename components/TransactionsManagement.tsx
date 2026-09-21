
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { Receipt, Search, Filter, CheckCircle2, Clock, User, Package, ChevronRight, X, Calendar, DollarSign } from 'lucide-react';
import { Order } from '../types';

export const TransactionsManagement: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'All' | 'Uncollected' | 'Collected'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full space-y-5 px-4 py-4 animate-in fade-in duration-700 sm:px-6 sm:py-6 md:space-y-7 lg:px-8">
      <header className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">Orders</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{filteredOrders.length} {filteredOrders.length === 1 ? 'transaction' : 'transactions'}</p>
        </div>
        <div className="flex gap-2 sm:justify-end">
          <div className="relative group w-full min-w-0 sm:min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
            <input 
              type="text" 
              placeholder="Search by student or ID..." 
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
            <option value="Uncollected">Uncollected</option>
            <option value="Collected">Collected</option>
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
          {filteredOrders.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Receipt size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No orders found</p>
              <p className="mt-1 text-xs text-slate-400">Try another student, ID, or status.</p>
            </div>
          ) : filteredOrders.map(order => (
            <button key={order.id} type="button" onClick={() => setSelectedOrder(order)} className="flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{order.studentName[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{order.studentName}</p>
                  <span className="shrink-0 font-mono text-sm font-semibold text-slate-950 dark:text-white">${order.total}</span>
                </div>
                <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">#{order.id.substring(0, 8).toUpperCase()} · {order.studentId}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${order.status === 'Collected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{order.status}</span>
                  <span className="text-[10px] text-slate-400">{new Date(order.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
              <ChevronRight size={17} className="shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Student / ID</th>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Fulfillment</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest italic">No transactions found in database.</td></tr>
              ) : filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group" onClick={() => setSelectedOrder(order)}>
                  <td className="px-8 py-6 font-mono text-[10px] font-bold text-slate-400">#{order.id.substring(0,8).toUpperCase()}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-black text-xs uppercase">{order.studentName[0]}</div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">{order.studentName}</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-1">{order.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-medium text-slate-500">{new Date(order.timestamp).toLocaleString()}</td>
                  <td className="px-8 py-6 font-black text-blue-600 dark:text-blue-400 font-mono">${order.total}</td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${order.status === 'Collected' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && createPortal((
        <div className="fixed inset-0 z-[800] flex justify-end bg-white dark:bg-slate-950 md:bg-slate-950/60 md:backdrop-blur-sm">
           <div className="absolute inset-0 hidden md:block" onClick={() => setSelectedOrder(null)} />
           <aside className="relative flex h-full w-full flex-col overflow-hidden bg-white dark:bg-slate-950 md:w-[60%] md:border-l md:border-slate-200 md:shadow-2xl lg:w-[45%] dark:md:border-slate-800">
              <header className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-6 sm:py-4">
                 <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950 sm:h-12 sm:w-12">{selectedOrder.studentName[0]}</div>
                    <div className="min-w-0">
                       <h2 className="text-sm font-semibold text-slate-950 dark:text-white sm:text-base">Order summary</h2>
                       <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">#{selectedOrder.id}</p>
                    </div>
                 </div>
                 <button aria-label="Close order summary" onClick={() => setSelectedOrder(null)} className="grid h-9 w-9 shrink-0 place-items-center text-slate-500 transition hover:text-slate-950 dark:hover:text-white"><X size={21} /></button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 sm:p-6 md:p-10 md:space-y-12">
                 <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Technical Assets Purchased</h3>
                    <div className="space-y-4">
                       {selectedOrder.items.map((item, idx) => (
                         <div key={idx} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex min-w-0 items-center gap-3">
                               <img src={item.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                               <div className="min-w-0">
                                  <p className="text-xs font-black uppercase tracking-tight">{item.name}</p>
                                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">QTY: {item.quantity}</p>
                               </div>
                            </div>
                            <span className="font-mono font-bold text-sm text-slate-600">${item.price * item.quantity}</span>
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-2">Payment Method</p>
                       <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-emerald-500" />
                          <span className="text-xs font-black uppercase">{selectedOrder.paymentMethod}</span>
                       </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-400 mb-2">Collection Node</p>
                       <div className="flex items-center gap-2">
                          <Package size={14} className="text-blue-500" />
                          <span className="text-xs font-black uppercase">{selectedOrder.status}</span>
                       </div>
                    </div>
                 </section>
              </div>

              <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950 sm:p-4">
                 <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-medium text-slate-500">Transaction total</span>
                    <span className="font-mono text-xl font-semibold text-slate-950 dark:text-white">${selectedOrder.total}</span>
                 </div>
                 {selectedOrder.status === 'Uncollected' ? (
                   <button 
                    onClick={() => { updateOrderStatus(selectedOrder.id, 'Collected'); setSelectedOrder(null); }}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-xs font-medium text-white transition hover:bg-emerald-700"
                   >
                      <CheckCircle2 size={20} /> Mark as Collected
                   </button>
                 ) : (
                   <button 
                    onClick={() => { updateOrderStatus(selectedOrder.id, 'Uncollected'); setSelectedOrder(null); }}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-amber-500 px-4 text-xs font-medium text-white transition hover:bg-amber-600"
                   >
                      <Clock size={20} /> Mark as Uncollected
                   </button>
                 )}
              </footer>
           </aside>
        </div>
      ), document.body)}
    </div>
  );
};
