
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
import { AlertCircle, BarChart3, Bell, CheckCircle2, FileText, Home, Info, LogOut, Receipt, X } from 'lucide-react';

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

const ParentMobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, logout, user, notices } = useStore();

  const unreadNotices = React.useMemo(() => {
    if (!user) return 0;
    return notices.filter(notice =>
      (notice.target === 'ALL' || notice.target === user.role) &&
      (!notice.recipientUserId || notice.recipientUserId === user.id) &&
      !(notice.views || []).some(view => view.userId === user.id)
    ).length;
  }, [notices, user]);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'clinical-history', label: 'Reports', icon: FileText },
    { id: 'fees', label: 'Fees', icon: Receipt },
    { id: 'notices', label: 'Notices', icon: Bell },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
  };

  return (
    <div className="min-h-screen bg-[#fbf8ff] dark:bg-slate-950 text-slate-950">
      <button
        onClick={logout}
        className="fixed right-5 top-5 z-[90] h-10 w-10 rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.10)] backdrop-blur-xl grid place-items-center hover:text-rose-600 transition-colors"
        title={`Logout${user?.name ? ` ${user.name}` : ''}`}
      >
        <LogOut size={16} strokeWidth={2.6} />
      </button>
      <main className="min-h-screen max-w-md mx-auto px-5 pt-5 pb-28 overflow-x-hidden">
        <div key={activeTab} className="animate-parent-tab">
          {children}
        </div>
      </main>
      <nav className="fixed left-4 right-4 bottom-5 z-[80] max-w-sm mx-auto h-[58px] rounded-[29px] border border-white/80 bg-white/85 backdrop-blur-2xl shadow-[0_18px_45px_rgba(15,23,42,0.16)] px-2 flex items-center justify-between">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'dashboard' && activeTab === 'students');
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`h-11 min-w-0 flex-1 rounded-[22px] flex flex-col items-center justify-center gap-0.5 transition-all duration-300 ${
                isActive ? 'bg-[#7c3aed] text-white shadow-[0_10px_24px_rgba(124,58,237,0.32)] scale-[1.02]' : 'text-slate-500 hover:text-[#7c3aed]'
              }`}
            >
              <span className="relative">
                <Icon size={15} strokeWidth={2.6} />
                {item.id === 'notices' && unreadNotices > 0 && (
                  <span className="absolute -right-3 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[7px] font-black text-white ring-2 ring-white">
                    {unreadNotices > 9 ? '9+' : unreadNotices}
                  </span>
                )}
              </span>
              <span className="text-[7.5px] font-black leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  const { view, setView, activeTab, isLoggedIn, theme, user, initializeData } = useStore();
  const isParentPortal = isLoggedIn && (user?.role === 'PARENT' || user?.role === 'STUDENT') && view !== 'verify' && view !== 'id-verify' && view !== 'apply' && view !== 'careers';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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
      {!isParentPortal && <NoticesSlideOver />}
      {isParentPortal ? (
        <ParentMobileShell>
          {renderContent()}
        </ParentMobileShell>
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
