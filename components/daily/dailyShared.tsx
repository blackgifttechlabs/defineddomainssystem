import { useEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useDailyStore } from '../../store/useDailyStore';

export const dailyInput = "w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
export const dailyBtn = "px-4 py-2 rounded-[9px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-60";
export const dailyCard = "border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 rounded-xl";

export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Starts the daily-use Firestore listeners once. */
export const useDailyData = () => {
  const start = useDailyStore(s => s.start);
  useEffect(() => { start(); }, [start]);
};

/** Students the signed-in staff member may work with (all for admins, assigned classes for staff). */
export const useMyStudents = () => {
  const { students, staff, user } = useStore();
  return useMemo(() => {
    if (user?.role === 'SPECIALIST' || user?.role === 'ADMIN_SUPPORT') {
      const me = staff.find(st => st.id === user.id);
      if (me?.assignedClasses?.length) return students.filter(s => me.assignedClasses.includes(s.assignedClass));
    }
    return students;
  }, [students, staff, user]);
};
