
import React, { useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useStore } from '../../store/useStore';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeTab = useStore((state) => state.activeTab);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll to top of the main container whenever the tab changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main ref={mainRef} className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto w-full max-w-[1600px] pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
