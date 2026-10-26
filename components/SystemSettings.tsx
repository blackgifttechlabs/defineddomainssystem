
import React, { useState, useEffect } from 'react';
import { useStore, MilestoneTemplate } from '../store/useStore';
import { 
  ArrowLeft, X, BookOpen, CreditCard, Building, User, ListChecks, Briefcase, Save, Loader2, PlusCircle, Trash2
} from 'lucide-react';
import { ChecklistTemplates } from './admin-settings/ChecklistTemplates';
import { DefaultTasks } from './admin-settings/DefaultTasks';
import { FeesAndTerm } from './admin-settings/FeesAndTerm';
import { JobPositions } from './admin-settings/JobPositions';
import { Classes } from './admin-settings/Classes';
import { MyProfile } from './admin-settings/MyProfile';

type SettingsTab = 'checklists' | 'tasks' | 'fees' | 'jobs' | 'school' | 'profile';

export const SystemSettings: React.FC = () => {
  const { user, saveMilestoneTemplate, notify } = useStore();
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isSpecialist = user?.role === 'SPECIALIST';
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(isAdmin ? 'checklists' : 'profile');
  const [editingTemplate, setEditingTemplate] = useState<MilestoneTemplate | null>(null);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);
  const inputBorderStyle = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    const cleaned = {
      ...editingTemplate,
      label: editingTemplate.label.trim(),
      sections: editingTemplate.sections.map(section => ({
        title: section.title.trim(), items: section.items.map(item => item.trim()).filter(Boolean)
      })),
      redFlags: (editingTemplate.redFlags || []).map(item => item.trim()).filter(Boolean)
    };
    if (!cleaned.label || !Number.isFinite(cleaned.minAge) || !Number.isFinite(cleaned.maxAge) || cleaned.minAge < 0 || cleaned.maxAge < cleaned.minAge || !cleaned.sections.length || cleaned.sections.some(section => !section.title || !section.items.length)) {
      notify('error', 'Enter a label, valid age range, and at least one item in each named category.');
      return;
    }
    setIsTemplateSaving(true);
    try {
      await saveMilestoneTemplate(cleaned);
      setEditingTemplate(null);
      notify('success', 'Checklist template saved.');
    } catch {
      // The store displays the save error; keep the editor open for retry.
    } finally {
      setIsTemplateSaving(false);
    }
  };

  const handleAddTemplate = () => {
    setEditingTemplate({
      id: `m-${Date.now()}`,
      label: 'New Template',
      minAge: 0,
      maxAge: 36,
      sections: [{ title: 'Movement', items: ['Step one'] }],
      redFlags: ['Warning one']
    });
  };

  // Ensure Specialists stay on profile tab
  useEffect(() => {
    if (isSpecialist) setActiveTab('profile');
  }, [isSpecialist]);

  const allTabs = [
    { id: 'checklists', label: 'Checklists', icon: <BookOpen size={16}/>, adminOnly: true },
    { id: 'tasks', label: 'Tasks', icon: <ListChecks size={16}/>, adminOnly: true },
    { id: 'fees', label: 'Fees & Term', icon: <CreditCard size={16}/>, adminOnly: true },
    { id: 'jobs', label: 'Roles', icon: <Briefcase size={16}/>, adminOnly: true },
    { id: 'school', label: 'Classes', icon: <Building size={16}/>, adminOnly: true },
    { id: 'profile', label: 'Profile Settings', icon: <User size={16}/>, adminOnly: false }
  ];

  const visibleTabs = allTabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <div className="w-full space-y-5 font-sans animate-in fade-in duration-500 selection:bg-blue-100">
      <header className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 sm:px-6">
        <h1 className="text-xl font-semibold leading-none tracking-tight text-slate-900 dark:text-white sm:text-2xl">Settings</h1>
        <p className="mt-1.5 text-xs text-slate-500">
          {isAdmin ? 'Manage school preferences, checklist templates and your profile' : 'Manage your profile and account'}
        </p>
      </header>

      <div className="mx-4 sm:mx-6 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900 sm:flex sm:w-fit sm:max-w-full sm:overflow-x-auto">
         {visibleTabs.map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-[10px] font-medium transition-all sm:justify-start sm:px-4 ${activeTab === tab.id ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      <div className="mx-4 sm:mx-6 min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ">
        {activeTab === 'checklists' && isAdmin && <ChecklistTemplates onEdit={template => setEditingTemplate(structuredClone(template))} onAdd={handleAddTemplate} />}
        {activeTab === 'tasks' && isAdmin && <DefaultTasks />}
        {activeTab === 'fees' && isAdmin && <FeesAndTerm />}
        {activeTab === 'jobs' && isAdmin && <JobPositions />}
        {activeTab === 'school' && isAdmin && <Classes />}
        {activeTab === 'profile' && <MyProfile />}
      </div>

      {editingTemplate && isAdmin && (
        <div className="fixed bottom-0 right-0 top-[72px] left-0 md:left-64 z-30 !mt-0 flex bg-white dark:bg-slate-900">
           <section aria-label="Edit checklist template" className="relative h-full w-full min-h-0 bg-white dark:bg-slate-900 flex flex-col overflow-hidden animate-in fade-in duration-200">
              <header className="shrink-0 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6 flex flex-wrap items-center justify-between gap-3">
                 <div className="flex min-w-0 items-center gap-3">
                    <button type="button" aria-label="Back to checklist templates" disabled={isTemplateSaving} onClick={() => setEditingTemplate(null)} className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"><ArrowLeft size={20} /></button>
                    <h3 className="text-base font-semibold tracking-tight dark:text-white">Edit checklist template</h3>
                 </div>
                 <div className="ml-auto flex items-center gap-2">
                    <button type="button" disabled={isTemplateSaving} onClick={() => setEditingTemplate(null)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                    <button type="button" onClick={handleSaveTemplate} disabled={isTemplateSaving} className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                       {isTemplateSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                       {isTemplateSaving ? 'Saving...' : 'Save template'}
                    </button>
                 </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar sm:p-6 md:p-6 md:space-y-6">
                 <div className="grid w-full max-w-3xl grid-cols-2 items-end gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <label className="col-span-2 flex min-w-0 flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 lg:col-span-1">
                       Template label
                       <input value={editingTemplate.label} onChange={e => setEditingTemplate({...editingTemplate, label: e.target.value})} className={`h-10 w-full rounded-lg border ${inputBorderStyle} bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none dark:bg-slate-950 dark:text-white`} />
                    </label>
                    <label className="flex min-w-0 flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                       Minimum age (months)
                       <input type="number" min="0" value={editingTemplate.minAge} onChange={e => setEditingTemplate({...editingTemplate, minAge: parseInt(e.target.value)})} className={`h-10 w-full rounded-lg border ${inputBorderStyle} bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none dark:bg-slate-950 dark:text-white`} />
                    </label>
                    <label className="flex min-w-0 flex-col gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                       Maximum age (months)
                       <input type="number" min="0" value={editingTemplate.maxAge} onChange={e => setEditingTemplate({...editingTemplate, maxAge: parseInt(e.target.value)})} className={`h-10 w-full rounded-lg border ${inputBorderStyle} bg-slate-50 px-3 text-sm font-medium text-slate-900 outline-none dark:bg-slate-950 dark:text-white`} />
                    </label>
                 </div>

                 <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                       <h4 className="text-sm font-semibold uppercase tracking-widest text-[#154A70]">Assessment Sections</h4>
                       <button onClick={() => setEditingTemplate({...editingTemplate, sections: [...editingTemplate.sections, { title: 'New Area', items: ['Goal'] }]})} className="flex items-center gap-2 text-[10px] font-semibold uppercase text-[#154A70] hover:underline"><PlusCircle size={14}/> Add Area</button>
                    </div>
                    {editingTemplate.sections.map((section, sIdx) => (
                       <div key={sIdx} className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 relative">
                          <button onClick={() => setEditingTemplate({...editingTemplate, sections: editingTemplate.sections.filter((_, i) => i !== sIdx)})} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600"><Trash2 size={16}/></button>
                          <input value={section.title} onChange={e => { const next = [...editingTemplate.sections]; next[sIdx].title = e.target.value; setEditingTemplate({...editingTemplate, sections: next}); }} className="bg-transparent font-semibold text-sm border-b-2 border-slate-200 focus:border-[#154A70] outline-none w-full pr-8 pb-2 dark:text-white mb-6" />
                          <div className="space-y-2">
                             {section.items.map((item, iIdx) => (
                               <div key={iIdx} className="flex gap-2">
                                  <input value={item} onChange={e => { const next = [...editingTemplate.sections]; next[sIdx].items[iIdx] = e.target.value; setEditingTemplate({...editingTemplate, sections: next}); }} className={`min-w-0 flex-1 p-3 bg-white dark:bg-slate-900 border ${inputBorderStyle} rounded-lg text-xs font-bold text-black dark:text-white`} />
                                  <button onClick={() => { const next = [...editingTemplate.sections]; next[sIdx].items.splice(iIdx, 1); setEditingTemplate({...editingTemplate, sections: next}); }} className="p-3 text-rose-300 hover:text-rose-600"><X size={14}/></button>
                               </div>
                             ))}
                          </div>
                          <button type="button" onClick={() => setEditingTemplate({ ...editingTemplate, sections: editingTemplate.sections.map((area, index) => index === sIdx ? { ...area, items: [...area.items, ''] } : area) })} className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-blue-300 px-3 py-2.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30">
                            <PlusCircle size={15} /> Add custom checklist item
                          </button>
                       </div>
                    ))}
                 </div>
              </div>


           </section>
        </div>
      )}
    </div>
  );
};
