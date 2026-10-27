
import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { AppShell } from './components/common/AppShell';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { TherapistDashboard } from './components/TherapistDashboard';
import { StaffManagement } from './components/StaffManagement';
import { StudentDirectory } from './components/StudentDirectory';
import { ClinicalABA } from './components/ClinicalABA';
import { LessonLogs } from './components/LessonLogs';
import { TeachLounge } from './components/TeachLounge';
import { AdminClinicalLogs } from './components/AdminClinicalLogs';
import { UniformShop } from './components/UniformShop';
import { SystemSettings } from './components/SystemSettings';
import { StudentDashboard } from './components/student/StudentDashboard';
import { SchoolFees } from './components/student/SchoolFees';
import { ParentNotices } from './components/student/ParentNotices';
import { ApplicationsManagement } from './components/ApplicationsManagement';
import { StudentApplications } from './components/admin/StudentApplications';
import { TransactionsManagement } from './components/TransactionsManagement';
import { OrderHistory } from './components/OrderHistory';
import { ReceiptVerification } from './components/student/ReceiptVerification';
import { OnlineApplication } from './components/landing/OnlineApplication';
import { CareersPage } from './components/landing/CareersPage';
import { StudentIdVerification } from './components/landing/StudentIdVerification';
import { IdCardManagement } from './components/admin/IdCardManagement';
import { NoticesSlideOver } from './components/common/NoticesSlideOver';
import { AdminNotices } from './components/AdminNotices';
import { SystemLogs } from './components/SystemLogs';
import { Attendance } from './components/Attendance';
import { IncidentsMedication } from './components/IncidentsMedication';
import { IepPlans } from './components/IepPlans';
import { TermReports } from './components/TermReports';
import { SchedulePlanner } from './components/SchedulePlanner';
import { ChildCare } from './components/student/ChildCare';
import { ParentMore } from './components/student/ParentMore';
import { Messages } from './components/Messages';
import { FeeArrears } from './components/FeeArrears';
import { Transport } from './components/Transport';
import { DataExport } from './components/DataExport';
import { AccessibilityToggle } from './components/common/AccessibilityToggle';
import { AlertCircle, BarChart3, Bell, CheckCircle2, FileText, Home, Info, LogOut, MessageCircle, MoreHorizontal, Receipt, X, Menu, CalendarDays, ClipboardList, HeartPulse, Bus, Settings, ShoppingBag } from 'lucide-react';

const NotificationHost = () => {
  const { notifications, removeNotification } = useStore();

  return (
    <div className="pointer-events-none fixed left-1/2 top-3 z-[700] flex w-[calc(100%-24px)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:top-5">
      {[...(notifications || [])].reverse().map((n) => (
        <div 
          key={n.id} 
          className="pointer-events-auto flex w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/90 px-3.5 py-3 text-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.18)] backdrop-blur-2xl animate-notification-in dark:border-white/10 dark:bg-slate-900/90 dark:text-white"
        >
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`}>
            {n.type === 'success' && <CheckCircle2 size={17} />}
            {n.type === 'error' && <AlertCircle size={17} />}
            {n.type === 'info' && <Info size={17} />}
          </div>
          <p className="min-w-0 flex-1 text-[13px] font-medium leading-5">{n.message}</p>
          <button aria-label="Dismiss notification" onClick={() => removeNotification(n.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

const ParentPortalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, logout, user, notices } = useStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuButton = React.useRef<HTMLButtonElement>(null);
  const menuPanel = React.useRef<HTMLElement>(null);
  const unread = notices.filter(n => (n.target === 'ALL' || n.target === user?.role) &&
    (!n.recipientUserId || n.recipientUserId === user?.id) && !n.views?.some(v => v.userId === user?.id)).length;
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'clinical-history', label: 'Reports', icon: FileText },
    { id: 'fees', label: 'Fees', icon: Receipt },
    { id: 'notices', label: 'Notices', icon: Bell },
    ...(user?.role === 'PARENT' ? [{ id: 'messages', label: 'Messages', icon: MessageCircle }] : []),
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'iep-plans', label: 'Learning plan', icon: ClipboardList },
    { id: 'child-care', label: 'Care', icon: HeartPulse },
    { id: 'transport', label: 'Transport', icon: Bus },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'order-history', label: 'Orders', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  const closeMenu = () => { setMenuOpen(false); menuButton.current?.focus(); };
  React.useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    menuPanel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
      if (event.key === 'Tab') {
        const buttons = menuPanel.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [menuOpen]);
  const navigation = <>
    <div className="flex items-center gap-3 px-3 py-5 text-sm font-semibold"><img src="https://i.ibb.co/spSVqW8s/definedlogo.png" alt="" className="h-7 w-7 object-contain" />Defined Domain</div>
    <nav aria-label="Portal navigation" className="flex-1 space-y-1 overflow-y-auto py-3">
      {navItems.map(item => {
        const selected = activeTab === item.id || (item.id === 'clinical-history' && activeTab === 'reports');
        return <button key={item.id} aria-current={selected ? 'page' : undefined} onClick={() => { setActiveTab(item.id); closeMenu(); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${selected ? 'bg-[#eee8f5] text-[#3b1764] font-semibold' : 'text-neutral-600 hover:bg-neutral-200/60'}`}>
          <item.icon size={18} strokeWidth={1.7} />{item.label}
          {item.id === 'notices' && unread > 0 && <span className="ml-auto rounded bg-[#3b1764] px-1.5 text-xs text-white">{unread}</span>}
        </button>;
      })}
    </nav>
    <div className="border-t border-neutral-200 px-3 py-4"><p className="truncate text-sm font-medium">{user?.name}</p><button onClick={logout} className="mt-3 flex items-center gap-2 py-2 text-sm text-neutral-600"><LogOut size={16} />Sign out</button></div>
  </>;
  return (
    <div className="parent-portal min-h-screen bg-white text-neutral-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-neutral-200 bg-[#f9f9fa] px-3 lg:flex">{navigation}</aside>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-4 lg:hidden">
        <button ref={menuButton} aria-label="Open menu" aria-expanded={menuOpen} aria-controls="parent-mobile-menu" onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-lg hover:bg-neutral-100"><Menu size={22} /></button>
        <span className="text-sm font-semibold">Defined Domain</span>
      </header>
      {menuOpen && <div className="fixed inset-0 z-[200] lg:hidden">
        <div className="absolute inset-0 bg-black/30" onClick={closeMenu} aria-hidden="true" />
        <aside ref={menuPanel} id="parent-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-y-0 left-0 flex w-[min(85vw,320px)] flex-col bg-[#f9f9fa] px-3 shadow-xl">
          <button aria-label="Close menu" onClick={closeMenu} className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-lg hover:bg-neutral-200"><X size={20} /></button>
          {navigation}
        </aside>
      </div>}
      <main className="min-w-0 px-4 py-7 lg:ml-60 lg:px-10 lg:py-10"><div key={activeTab} className="mx-auto max-w-6xl">{children}</div></main>
    </div>
  );
};

const App: React.FC = () => {
  const { view, setView, activeTab, isLoggedIn, theme, user, initializeData } = useStore();
  const isParentPortal = isLoggedIn && (user?.role === 'PARENT' || user?.role === 'STUDENT') && view !== 'verify' && view !== 'id-verify' && view !== 'apply' && view !== 'careers';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !isParentPortal && theme === 'dark');
  }, [theme, isParentPortal]);

  useEffect(() => {
    initializeData();

    const checkUrlRoute = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.has('id-card')) {
        setView('id-verify');
      } else if (params.has('v')) {
        setView('verify');
      }
    };

    checkUrlRoute();
    window.addEventListener('popstate', checkUrlRoute);
    return () => window.removeEventListener('popstate', checkUrlRoute);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, activeTab]);

  const renderContent = () => {
    if (view === 'verify') return <ReceiptVerification />;
    if (view === 'id-verify') return <StudentIdVerification />;
    if (view === 'apply') return <OnlineApplication />;
    if (view === 'careers') return <CareersPage />;

    if (!isLoggedIn) {
      if (view === 'login') {
        return (
          <div className="relative w-screen h-screen overflow-hidden animate-notification-in">
            <LoginPage />
          </div>
        );
      }
      return <LandingPage />;
    }

    const role = user?.role;

    if (activeTab === 'messages' && role !== 'STUDENT') return <Messages />;
    if (activeTab === 'transport') return <Transport />;
    if ((role === 'PARENT' || role === 'STUDENT') && activeTab === 'more') return <ParentMore />;
    if ((role === 'PARENT' || role === 'STUDENT') && activeTab === 'child-care') return <ChildCare />;
    if ((role === 'SUPER_ADMIN' || role === 'ADMIN_SUPPORT') && activeTab === 'arrears') return <FeeArrears />;
    if ((role === 'SUPER_ADMIN' || role === 'ADMIN_SUPPORT') && activeTab === 'export') return <DataExport />;

    if (role === 'STUDENT' || role === 'PARENT') {
      if (activeTab === 'dashboard' || activeTab === 'progress') return <StudentDashboard />;
      if (activeTab === 'students' || activeTab === 'my-students') return <StudentDirectory />;
      if (activeTab === 'clinical-history' || activeTab === 'reports') return <AdminClinicalLogs />;
      if (activeTab === 'notices') return <ParentNotices />;
      if (activeTab === 'order-history') return <OrderHistory />;
      if (activeTab === 'shop') return <UniformShop />;
      if (activeTab === 'settings') return <SystemSettings />;
      if (activeTab === 'fees') return <SchoolFees />;
    }

    if (role === 'SPECIALIST' || role === 'ADMIN_SUPPORT') {
      if (activeTab === 'dashboard') return <TherapistDashboard />;
      if (activeTab === 'my-students' || activeTab === 'students') return <StudentDirectory />;
      if (activeTab === 'clinical') return <ClinicalABA />;
      if (activeTab === 'clinical-logs') return <LessonLogs />;
      if (activeTab === 'lounge') return <TeachLounge />;
      if (activeTab === 'attendance') return <Attendance />;
      if (activeTab === 'care-log') return <IncidentsMedication />;
      if (activeTab === 'settings') return <SystemSettings />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'staff':
      case 'admin':
        return <StaffManagement />;
      case 'applications':
        return <ApplicationsManagement />;
      case 'student-applications':
        return <StudentApplications />;
      case 'orders':
        return <TransactionsManagement />;
      case 'order-history':
        return <OrderHistory />;
      case 'students':
      case 'my-students':
        return <StudentDirectory />;
      case 'clinical':
        return <ClinicalABA />;
      case 'clinical-logs':
        return <LessonLogs />;
      case 'shop': return <UniformShop />;
      case 'settings': return <SystemSettings />;
      case 'notices': return <AdminNotices />;
      case 'system-logs': return <SystemLogs />;
      case 'id-cards': return <IdCardManagement />;
      case 'attendance': return <Attendance />;
      case 'care-log': return <IncidentsMedication />;
      case 'iep-plans': return <IepPlans />;
      case 'term-reports': return <TermReports />;
      case 'schedule': return <SchedulePlanner />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12">
             <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
               <span className="text-4xl">⚙️</span>
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tight">Module Loading</h2>
             <p className="text-slate-500 mt-2 max-w-sm">The <b>{activeTab}</b> module is being configured for your account.</p>
          </div>
        );
    }
  };

  return (
    <>
      <NotificationHost />
      {isLoggedIn && <AccessibilityToggle className={isParentPortal ? 'right-4 bottom-4' : 'left-4 bottom-4'} />}
      {!isParentPortal && <NoticesSlideOver />}
      {isParentPortal ? (
        <ParentPortalShell>
          {renderContent()}
        </ParentPortalShell>
      ) : isLoggedIn && view !== 'verify' && view !== 'id-verify' && view !== 'apply' && view !== 'careers' ? (
        <AppShell>
          {renderContent()}
        </AppShell>
      ) : (
        renderContent()
      )}
    </>
  );
};

export default App;
