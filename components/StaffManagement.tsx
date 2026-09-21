
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store/useStore';
import { 
  ChevronRight, 
  Search, 
  X, 
  Plus, 
  Loader2, 
  LayoutGrid, 
  List, 
  Save, 
  Trash2, 
  Edit2,
  Globe,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  ShieldCheck,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { Staff } from '../types';

const ProfileRow = ({ 
  label, 
  value, 
  field, 
  isEditing, 
  editForm, 
  setEditForm,
  options,
  multiple,
  availableClasses
}: { 
  label: string, 
  value: any, 
  field?: keyof Staff, 
  isEditing: boolean, 
  editForm: Partial<Staff>, 
  setEditForm: (val: Partial<Staff>) => void,
  options?: any[],
  multiple?: boolean,
  availableClasses?: string[]
}) => {
  const filteredValue = useMemo(() => {
    if (multiple && Array.isArray(value) && availableClasses) {
      return value.filter(v => availableClasses.includes(v));
    }
    return value;
  }, [value, multiple, availableClasses]);

  const displayValue = Array.isArray(filteredValue)
    ? filteredValue.join(', ')
    : (field === 'imageUrl' && typeof filteredValue === 'string' && filteredValue.startsWith('data:'))
      ? 'Uploaded profile image'
      : (filteredValue || 'None');
  const profileImage = field === 'imageUrl' ? String(editForm.imageUrl || value || '') : '';

  const viewProfileImage = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (profileImage && !profileImage.includes('No image')) {
      window.open(profileImage, '_blank', 'noopener,noreferrer');
    }
  };

  const setImageFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setEditForm({ ...editForm, imageUrl: String(reader.result || '') });
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid min-w-0 gap-1.5 border-b border-slate-200/70 py-4 last:border-b-0 dark:border-slate-800 sm:grid-cols-[minmax(120px,0.42fr)_minmax(0,1fr)] sm:gap-6 sm:py-5">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</div>
      <div className="min-w-0">
        {isEditing && field ? (
          field === 'imageUrl' ? (
            <label
              className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-blue-500 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
              onDragOver={e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={e => {
                e.preventDefault();
                setImageFile(e.dataTransfer.files?.[0]);
              }}
            >
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={e => setImageFile(e.target.files?.[0])}
              />
              {(editForm.imageUrl || value) && !String(editForm.imageUrl || value).includes('No image') ? (
                <img
                  src={String(editForm.imageUrl || value)}
                  alt="Profile preview"
                  className="mb-3 h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm dark:border-slate-700"
                />
              ) : (
                <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                  <ImageIcon size={18} />
                </span>
              )}
              <span className="rounded-md bg-slate-950 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-slate-950">Choose image</span>
              <span className="mt-2 text-xs text-slate-500">or drag and drop an image here</span>
              {profileImage && !profileImage.includes('No image') && (
                <button
                  type="button"
                  onClick={viewProfileImage}
                  className="mt-3 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  View full image
                </button>
              )}
            </label>
          ) : multiple && availableClasses ? (
            <div className="flex flex-wrap gap-2 py-2">
              {availableClasses.map(cls => (
                <label key={cls} className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 py-1.5 rounded-none cursor-pointer hover:border-blue-500 transition-all select-none">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded-none border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={(editForm.assignedClasses || []).includes(cls)}
                    onChange={e => {
                      const current = editForm.assignedClasses || [];
                      const next = e.target.checked 
                        ? [...current, cls]
                        : current.filter(c => c !== cls);
                      setEditForm({ ...editForm, assignedClasses: next });
                    }}
                  />
                  <span className="text-[10px] font-black uppercase tracking-tight">{cls}</span>
                </label>
              ))}
            </div>
          ) : options ? (
            <select 
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
              value={(editForm as any)[field] || ''}
              onChange={e => setEditForm({...editForm, [field]: e.target.value})}
            >
              <option value="">Choose...</option>
              {options.map(opt => {
                const name = typeof opt === 'string' ? opt : opt.name;
                return <option key={name} value={name}>{name}</option>;
              })}
            </select>
          ) : (
            <input 
              type={field === 'password' ? 'text' : 'text'}
              className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
              value={(editForm as any)[field] !== undefined ? (editForm as any)[field] : (field === 'password' ? value : '')}
              onChange={e => setEditForm({...editForm, [field]: e.target.value})}
              placeholder={field === 'password' ? 'Enter new password (min 6 characters)...' : `Enter ${label.toLowerCase()}...`}
            />
          )
        ) : (
          field === 'password' ? (
            <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {filteredValue || 'Not Set'}
            </span>
          ) : field === 'imageUrl' && profileImage && !profileImage.includes('No image') ? (
            <button
              type="button"
              onClick={viewProfileImage}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              View image
            </button>
          ) : (
            <span className="block min-w-0 break-words text-sm font-medium leading-6 text-slate-900 dark:text-slate-100">
              {displayValue}
            </span>
          )
        )}
      </div>
    </div>
  );
};

export const StaffManagement: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, settings, user } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'administration' | 'general'>('administration');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedClassesForAdd, setSelectedClassesForAdd] = useState<string[]>([]);
  const [addFormNationality, setAddFormNationality] = useState('Zimbabwean');
  const [isAddFormClosing, setIsAddFormClosing] = useState(false);
  const [staffImageData, setStaffImageData] = useState('');
  const [staffImageName, setStaffImageName] = useState('');

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const availableClasses = settings?.classes || [];
  const googleInput = "w-full px-4 py-3 rounded-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm text-slate-900 dark:text-white shadow-sm";
  const googleInputWithIcon = "w-full pl-12 pr-4 py-3 rounded-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-sm text-slate-900 dark:text-white shadow-sm";
  const googleLabel = "text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300 ml-1";
  const googleStepBadge = "text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-[15px] border border-blue-100 dark:border-blue-800";

  const filteredStaff = (staff || []).filter(s => {
    const isCorrectType = activeSubTab === 'administration' 
      ? (s.role === 'ADMIN_SUPPORT' || s.role === 'SUPER_ADMIN')
      : (s.role === 'SPECIALIST');
    
    const fullName = s.fullName.toLowerCase();
    return isCorrectType && (fullName.includes(searchTerm.toLowerCase()));
  });

  const openAddStaffForm = () => {
    setSelectedClassesForAdd([]);
    setAddFormNationality('Zimbabwean');
    setStaffImageData('');
    setStaffImageName('');
    setIsAddFormClosing(false);
    setIsAdding(true);
  };

  const closeAddStaffForm = (force = false) => {
    if (isSubmitting && !force) return;
    setIsAddFormClosing(true);
    window.setTimeout(() => {
      setIsAdding(false);
      setIsAddFormClosing(false);
    }, 180);
  };

  const handleStaffImageSelect = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setStaffImageData(String(reader.result || ''));
      setStaffImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    setIsSubmitting(true);
    try {
      await updateStaff(selectedStaff.id, editForm);
      setSelectedStaff({ ...selectedStaff, ...editForm });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    await deleteStaff(selectedStaff.id);
    setSelectedStaff(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="w-full space-y-5 px-4 py-4 animate-in fade-in duration-500 sm:px-6 sm:py-6 md:space-y-7 md:px-8">
      {isAdmin && (
        <div className="flex justify-end">
          <button onClick={openAddStaffForm} className="flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 sm:h-10 sm:px-4 sm:text-sm">
            <Plus size={16} /> Add staff
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 sm:flex sm:items-center">
        <button onClick={() => setActiveSubTab('administration')} className={`border-b-2 px-3 py-3 text-xs font-medium transition-all sm:px-5 ${activeSubTab === 'administration' ? 'border-slate-950 text-slate-950 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>Office &amp; Support</button>
        <button onClick={() => setActiveSubTab('general')} className={`border-b-2 px-3 py-3 text-xs font-medium transition-all sm:px-5 ${activeSubTab === 'general' ? 'border-slate-950 text-slate-950 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>Teachers</button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1 group">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-10 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600"
          />
        </div>
        <div className="flex h-10 shrink-0 gap-0.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/60">
          <button aria-label="List view" onClick={() => setViewMode('table')} className={`grid w-8 place-items-center rounded transition-all ${viewMode === 'table' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}><List size={17} /></button>
          <button aria-label="Card view" onClick={() => setViewMode('cards')} className={`grid w-8 place-items-center rounded transition-all ${viewMode === 'cards' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={17} /></button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:rounded-xl">
        {viewMode === 'table' ? (
          <>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
            {filteredStaff.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-slate-500">No matching staff found.</div>
            ) : filteredStaff.map(s => {
              const sClasses = (s.assignedClasses || []).filter(c => availableClasses.includes(c));
              return (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setIsEditing(false); setEditForm(s); }}
                  className="flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    {s.imageUrl ? <img src={s.imageUrl} className="h-full w-full object-cover" alt="" /> : <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-400">{s.fullName[0]}</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{s.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{s.position || 'Staff member'}</p>
                    {sClasses.length > 0 && <p className="mt-1 truncate text-[11px] text-slate-400">{sClasses.join(' · ')}</p>}
                  </div>
                  <ChevronRight size={17} className="shrink-0 text-slate-400" />
                </button>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-950 dark:text-slate-400 border-b-2 border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-10 py-6 tracking-widest">Photo & Name</th>
                  <th className="px-8 py-6 tracking-widest">Job Role</th>
                  <th className="px-8 py-6 tracking-widest">Password</th>
                  <th className="px-8 py-6 tracking-widest">Classes</th>
                  <th className="px-10 py-6 text-right tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-24 text-center font-bold text-slate-300 uppercase text-xs tracking-widest">No matching staff found.</td>
                  </tr>
                ) : filteredStaff.map(s => {
                  const sClasses = (s.assignedClasses || []).filter(c => availableClasses.includes(c));
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 cursor-pointer group transition-colors" onClick={() => { setSelectedStaff(s); setIsEditing(false); setEditForm(s); }}>
                      <td className="px-10 py-6 flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                          {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs text-slate-400">{s.fullName[0]}</div>}
                        </div>
                        <span className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{s.fullName}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1.5 rounded-none bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800 shadow-sm">{s.position}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1.5 rounded-none bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-tight border border-amber-100 dark:border-amber-800 shadow-sm font-mono">{s.password || '••••••••'}</span>
                      </td>
                      <td className="px-8 py-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{sClasses.join(', ') || 'Not Assigned'}</td>
                      <td className="px-10 py-6 text-right"><ChevronRight size={20} className="ml-auto text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStaff.map(s => (
              <div key={s.id} className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950" onClick={() => { setSelectedStaff(s); setIsEditing(false); setEditForm(s); }}>
                <div className="mb-4 h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-black text-3xl text-slate-400 uppercase">{s.fullName[0]}</div>}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-slate-950 transition-colors dark:text-white">{s.fullName}</h3>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{s.position}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                   <span className="text-[10px] font-mono text-slate-400">{s.id.substring(0,8).toUpperCase()}</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStaff && createPortal((
        <div className="fixed inset-y-0 left-0 right-0 z-[800] flex min-h-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 md:left-64">
          <header className="z-20 shrink-0 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:px-6 sm:py-4 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button 
                onClick={() => setSelectedStaff(null)} 
                className="-ml-1 grid h-9 w-9 shrink-0 place-items-center text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                aria-label="Back to staff list"
              >
                <ArrowLeft size={22} />
              </button>
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 sm:h-11 sm:w-11">
                {selectedStaff.imageUrl ? <img src={selectedStaff.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400 uppercase">{selectedStaff.fullName[0]}</div>}
              </div>
              <div className="min-w-0">
                 <h2 className="truncate text-base font-semibold text-slate-950 dark:text-white">{selectedStaff.fullName}</h2>
                 <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{selectedStaff.position || 'Staff profile'}</p>
              </div>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              {isAdmin && (
                <>
                  <button onClick={() => setShowDeleteConfirm(true)} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-rose-600 transition hover:border-rose-200 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-rose-950/30 sm:flex-none sm:text-sm">
                    <Trash2 size={15}/> Remove
                  </button>
                  <button onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)} className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium text-white transition sm:flex-none sm:text-sm ${isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'}`}>
                    {isEditing ? <><Save size={15}/> Save changes</> : <><Edit2 size={15}/> Edit profile</>}
                  </button>
                </>
              )}
            </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden sidebar-scrollbar">
            <div className="w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
              <div className="mb-4 px-1 sm:mb-6 sm:px-0">
                <h1 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">Profile details</h1>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Personal, work, and account information.</p>
              </div>
             <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
                <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:rounded-xl">
                  <div className="border-b border-slate-200 px-4 py-3.5 dark:border-slate-800 sm:px-6 sm:py-4">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">General information</h3>
                    <p className="mt-1 text-xs text-slate-500">Personal and identity details.</p>
                  </div>
                  <div className="min-w-0 px-4 sm:px-6">
                        <ProfileRow label="First Name" value={selectedStaff.firstName} field="firstName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Surname" value={selectedStaff.lastName} field="lastName" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Profile Image Link" value={selectedStaff.imageUrl || 'No image link'} field="imageUrl" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Nationality" value={selectedStaff.nationality} field="nationality" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        {selectedStaff.nationality !== 'Zimbabwean' && (
                          <ProfileRow label="Passport" value={selectedStaff.passportNumber} field="passportNumber" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        )}
                        <ProfileRow label="ID Number" value={selectedStaff.nationalId || 'None'} field="nationalId" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Birth Date" value={selectedStaff.dob} field="dob" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Home Address" value={selectedStaff.address} field="address" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                  </div>
                </section>

                <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:rounded-xl">
                  <div className="border-b border-slate-200 px-4 py-3.5 dark:border-slate-800 sm:px-6 sm:py-4">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Work &amp; contact</h3>
                    <p className="mt-1 text-xs text-slate-500">Role, assignments, and account access.</p>
                  </div>
                  <div className="min-w-0 px-4 sm:px-6">
                        <ProfileRow label="Job Title" value={selectedStaff.position} field="position" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={settings?.positions || []} />
                        <ProfileRow label="Assigned Classes" value={selectedStaff.assignedClasses} field="assignedClasses" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} multiple availableClasses={availableClasses} />
                        <ProfileRow label="Email Address" value={selectedStaff.email} field="email" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Phone Number" value={selectedStaff.phone} field="phone" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="Password" value={selectedStaff.password || 'Not Set'} field="password" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} />
                        <ProfileRow label="System ID" value={selectedStaff.id} field="id" isEditing={false} editForm={editForm} setEditForm={setEditForm} />
                  </div>
                </section>
             </div>
            </div>
          </main>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[600] bg-white/98 dark:bg-slate-950/98 flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 backdrop-blur-md">
               <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-none border-4 border-rose-100 flex items-center justify-center mb-8 shadow-2xl"><Trash2 size={48}/></div>
               <h3 className="text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Erase staff record?</h3>
               <p className="text-base text-slate-500 dark:text-slate-400 font-medium mt-4 max-w-md mx-auto leading-relaxed">This will permanently remove <b>{selectedStaff.fullName}</b> from the system. They will no longer be able to log in.</p>
               <div className="flex gap-6 mt-12 w-full max-w-md">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 rounded-none font-black uppercase text-xs transition-all hover:bg-slate-200 active:scale-95">Cancel</button>
                  <button onClick={handleDelete} className="flex-1 py-5 bg-rose-600 text-white rounded-none font-black uppercase text-xs shadow-xl shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all">Yes, Delete</button>
               </div>
            </div>
          )}
        </div>
      ), document.body)}

      {isAdding && (
        <div className="fixed inset-0 z-[300] overflow-hidden">
          <div className={`absolute inset-0 bg-slate-100/95 dark:bg-slate-950/90 backdrop-blur-md ${isAddFormClosing ? 'form-backdrop-out' : 'form-backdrop-in'}`} onClick={() => closeAddStaffForm()} />
          <div className={`relative h-full w-full bg-white dark:bg-slate-900 shadow-2xl overflow-x-hidden overflow-y-auto sidebar-scrollbar ${isAddFormClosing ? 'form-screen-out' : 'form-screen-in'}`}>
             <div className="p-5 md:p-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-[15px] text-rose-500">
                      <Plus size={24} />
                   </div>
                   <div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Register Staff</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a staff account and profile.</p>
                   </div>
                </div>
                <button onClick={() => closeAddStaffForm()} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[15px] transition-colors"><X size={24}/></button>
             </div>
             
             <form onSubmit={async (e) => {
               e.preventDefault();
               if (selectedClassesForAdd.length === 0) {
                 alert("Please select at least one class.");
                 return;
               }
               setIsSubmitting(true);
               try {
                 const formData = new FormData(e.currentTarget);
                 const data = Object.fromEntries(formData.entries()) as any;
                 const role = activeSubTab === 'administration' ? 'ADMIN_SUPPORT' : 'SPECIALIST';
                 await addStaff({ 
                   ...data, 
                   role, 
                   assignedClasses: selectedClassesForAdd, 
                   nationality: addFormNationality 
                 });
                 closeAddStaffForm(true);
               } finally { setIsSubmitting(false); }
             }} className="w-full max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-rose-50/25 dark:bg-slate-950/20">
                <input type="hidden" name="imageUrl" value={staffImageData} />
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <section className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[15px] p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[15px] bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center text-[10px] font-bold">01</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">Identity</h4>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={googleLabel}>First Name</label>
                      <input required name="firstName" className={googleInput} placeholder="Enter first name" />
                    </div>
                    <div className="space-y-2">
                      <label className={googleLabel}>Surname</label>
                      <input required name="lastName" className={googleInput} placeholder="Enter surname" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className={googleLabel}>Profile Image</label>
                    <label className="flex items-center gap-3 px-4 py-3 rounded-[15px] bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 cursor-pointer hover:border-blue-500 hover:ring-4 hover:ring-blue-500/10 transition-all shadow-sm">
                      <input type="file" accept="image/*" className="sr-only" onChange={e => handleStaffImageSelect(e.target.files?.[0])} />
                      <div className="w-9 h-9 rounded-[12px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center text-slate-400">
                        {staffImageData ? <img src={staffImageData} className="w-full h-full object-cover" alt="Staff preview" /> : <ImageIcon size={17} />}
                      </div>
                      <span className="text-xs font-medium text-slate-500 truncate">{staffImageName || 'Choose image from device'}</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={googleLabel}>Nationality</label>
                      <div className="relative">
                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <select 
                          required 
                          value={addFormNationality} 
                          onChange={e => setAddFormNationality(e.target.value)}
                          className={`${googleInputWithIcon} appearance-none cursor-pointer`}
                        >
                          <option value="Zimbabwean">Zimbabwean</option>
                          <option value="South African">South African</option>
                          <option value="Zambian">Zambian</option>
                          <option value="Malawian">Malawian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    {addFormNationality !== 'Zimbabwean' ? (
                      <div className="space-y-2 animate-in slide-in-from-left duration-300">
                        <label className={googleLabel}>Passport ID</label>
                        <div className="relative">
                          <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input required name="passportNumber" placeholder="Enter ID" className={googleInputWithIcon} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className={googleLabel}>National ID</label>
                        <input name="nationalId" placeholder="63-XXXXXX-X-XX" className={googleInput} />
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[15px] p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[15px] bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center text-[10px] font-bold">02</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">Contact</h4>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <label className={googleLabel}>Email Address</label>
                      <input required type="email" name="email" className={googleInput} placeholder="name@defineddomain.com" />
                      <p className="text-[11px] text-slate-400">Used for login and parent or school updates.</p>
                    </div>
                    <div className="space-y-2">
                      <label className={googleLabel}>Phone Number</label>
                      <input required type="tel" name="phone" placeholder="+263..." className={googleInput} />
                      <p className="text-[11px] text-slate-400">Include the country code.</p>
                    </div>
                    <div className="space-y-2">
                    <label className={googleLabel}>Password</label>
                    <input type="password" name="password" placeholder="Enter a password" className={googleInput} />
                    <p className="text-[11px] text-slate-400">Used for staff member login.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[15px] p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[15px] bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center text-[10px] font-bold">03</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">Work</h4>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="space-y-2">
                    <label className={googleLabel}>Job Role</label>
                    <select name="position" className={`${googleInput} appearance-none cursor-pointer`}>
                      <option value="">Select role...</option>
                      {(settings?.positions || []).filter((p: any) => p.active).map((p: any) => {
                        const name = typeof p === 'string' ? p : p.name;
                        return <option key={name} value={name}>{name}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <label className={googleLabel}>Assigned Classes</label>
                      <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-[15px] border border-blue-100 dark:border-blue-800">
                        {selectedClassesForAdd.length} Chosen
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[15px] max-h-36 overflow-y-auto sidebar-scrollbar">
                      {availableClasses.map(cls => {
                        const isSelected = selectedClassesForAdd.includes(cls);
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => {
                              if (isSelected) setSelectedClassesForAdd(selectedClassesForAdd.filter(c => c !== cls));
                              else setSelectedClassesForAdd([...selectedClassesForAdd, cls]);
                            }}
                            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-[15px] text-[10px] font-bold uppercase tracking-tight transition-all border ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-300'
                            }`}
                          >
                            {isSelected ? <CheckCircle2 size={14} /> : <div className="w-3 h-3 rounded-full border-2 border-slate-200" />}
                            {cls}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
                </div>
                
                <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[15px] p-5 shadow-sm text-center">
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full sm:w-96 py-4 bg-rose-500 text-white rounded-[15px] font-bold tracking-wide text-sm shadow-xl shadow-rose-500/20 hover:bg-rose-600 active:scale-[0.99] transition-all inline-flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={22} className="animate-spin" /> : <>Save Staff Record <ChevronRight size={18}/></>}
                  </button>
                  <p className="text-[11px] text-slate-400 mt-4">Profile photos are converted to base64 before saving.</p>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
