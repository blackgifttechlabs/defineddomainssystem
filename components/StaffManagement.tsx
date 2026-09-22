
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
import { processStudentImage } from '../utils/imageProcessor';
import { ImageCropEditor } from './common/ImageCropEditor';

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
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [cropSource, setCropSource] = useState('');
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

  React.useEffect(() => {
    if (!isImagePreviewOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsImagePreviewOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isImagePreviewOpen]);

  const viewProfileImage = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (profileImage && !profileImage.includes('No image')) {
      setIsImagePreviewOpen(true);
    }
  };

  const setImageFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setCropSource(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  return (
    <>
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
                <span className="mt-3 flex items-center gap-3">
                  <button type="button" onClick={viewProfileImage} className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">View full image</button>
                  <button type="button" onClick={event => { event.preventDefault(); event.stopPropagation(); setCropSource(profileImage); }} className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">Crop image</button>
                </span>
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
    {isImagePreviewOpen && createPortal(
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Staff profile image"
        onClick={() => setIsImagePreviewOpen(false)}
      >
        <div className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl" onClick={event => event.stopPropagation()}>
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Profile image</h3>
              <p className="mt-0.5 text-xs text-slate-400">Staff photo preview</p>
            </div>
            <button type="button" aria-label="Close image preview" onClick={() => setIsImagePreviewOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              <X size={17} />
            </button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/30 p-3 sm:p-6">
            <img src={profileImage} alt="Staff profile" className="max-h-[calc(100vh-9rem)] max-w-full rounded-xl object-contain" />
          </div>
        </div>
      </div>,
      document.body
    )}
    {cropSource && (
      <ImageCropEditor
        source={cropSource}
        onCancel={() => setCropSource('')}
        onApply={image => {
          setEditForm({ ...editForm, imageUrl: image });
          setCropSource('');
        }}
      />
    )}
    </>
  );
};

export const StaffManagement: React.FC = () => {
  const { staff, addStaff, updateStaff, deleteStaff, settings, user, notify } = useStore();
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
  const [newStaffCropSource, setNewStaffCropSource] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
    const query = searchTerm.trim().toLowerCase();
    return isCorrectType && (!query || fullName.includes(query) || (s.email || '').toLowerCase().includes(query) || (s.position || '').toLowerCase().includes(query) || (s.assignedClasses || []).some(className => className.toLowerCase().includes(query)));
  });
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  React.useEffect(() => setCurrentPage(1), [searchTerm, activeSubTab]);

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

  const handleStaffImageSelect = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const result = await processStudentImage(file, { maxDimension: 700, quality: 0.82 });
      setStaffImageName(file.name);
      setNewStaffCropSource(result.base64);
    } catch {
      notify('error', 'The selected staff photo could not be processed.');
    }
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
      <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 sm:flex sm:items-center">
        <button onClick={() => setActiveSubTab('administration')} className={`border-b-2 px-3 py-3 text-xs font-medium transition-all sm:px-5 ${activeSubTab === 'administration' ? 'border-slate-950 text-slate-950 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>Office &amp; Support</button>
        <button onClick={() => setActiveSubTab('general')} className={`border-b-2 px-3 py-3 text-xs font-medium transition-all sm:px-5 ${activeSubTab === 'general' ? 'border-slate-950 text-slate-950 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}>Teachers</button>
      </div>

      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <h2 className="text-base font-semibold tracking-tight text-slate-950 dark:text-white md:text-lg">{filteredStaff.length} {activeSubTab === 'administration' ? 'Office & Support' : 'Teachers'}</h2>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:min-w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search staff by name, email, role or class..."
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5 dark:border-slate-800 dark:bg-slate-900 dark:focus:border-slate-600"
          />
        </div>
        <div className="flex h-10 shrink-0 gap-0.5 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/60">
          <button aria-label="List view" onClick={() => setViewMode('table')} className={`grid w-8 place-items-center rounded transition-all ${viewMode === 'table' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}><List size={17} /></button>
          <button aria-label="Card view" onClick={() => setViewMode('cards')} className={`grid w-8 place-items-center rounded transition-all ${viewMode === 'cards' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={17} /></button>
        </div>
        {isAdmin && <button onClick={openAddStaffForm} className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-md bg-slate-950 px-3.5 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"><Plus size={15} /> Add staff</button>}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:rounded-xl">
        {viewMode === 'table' ? (
          <>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
            {filteredStaff.length === 0 ? (
              <div className="px-5 py-16 text-center text-sm text-slate-500">No matching staff found.</div>
            ) : paginatedStaff.map(s => {
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
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Staff member</th>
                  <th className="px-5 py-3.5 font-semibold">Job role</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Assigned classes</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-medium text-slate-400">No matching staff found.</td>
                  </tr>
                ) : paginatedStaff.map(s => {
                  const sClasses = (s.assignedClasses || []).filter(c => availableClasses.includes(c));
                  return (
                    <tr key={s.id} className="group cursor-pointer transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50" onClick={() => { setSelectedStaff(s); setIsEditing(false); setEditForm(s); }}>
                      <td className="flex items-center gap-3 px-5 py-4">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                          {s.imageUrl ? <img src={s.imageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs text-slate-400">{s.fullName[0]}</div>}
                        </div>
                        <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-950 dark:text-white">{s.fullName}</p><p className="mt-0.5 font-mono text-[10px] text-slate-400">{s.id.slice(0, 10)}</p></div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s.position || 'Not assigned'}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{s.email}</td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">{sClasses.join(', ') || 'Not assigned'}</td>
                      <td className="px-5 py-4 text-right"><ChevronRight size={17} className="ml-auto text-slate-400" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedStaff.map(s => (
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

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-1 pt-4 text-xs text-slate-500 dark:border-slate-800 sm:flex-row">
        <p>
          Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredStaff.length ? (currentPage - 1) * pageSize + 1 : 0}</span>–<span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredStaff.length)}</span> of <span className="font-semibold text-slate-900 dark:text-white">{filteredStaff.length}</span>
        </p>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage === 1} className="rounded-md border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Previous</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
            <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`hidden h-8 w-8 rounded-md text-xs font-medium sm:block ${currentPage === page ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{page}</button>
          ))}
          <button type="button" onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages} className="rounded-md border border-slate-200 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800">Next</button>
        </div>
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

      {isAdding && createPortal((
        <div className="fixed inset-0 z-[300] overflow-hidden bg-white dark:bg-slate-950">
          <div className={`relative h-full w-full overflow-x-hidden overflow-y-auto bg-white dark:bg-slate-950 sidebar-scrollbar ${isAddFormClosing ? 'form-screen-out' : 'form-screen-in'}`}>
             <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                   <div className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                      <Plus size={19} />
                   </div>
                   <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">Register staff</h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Create a staff account and assign access.</p>
                   </div>
                </div>
                <button aria-label="Close" onClick={() => closeAddStaffForm()} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"><X size={18}/></button>
             </div>
             
             <form onSubmit={async (e) => {
               e.preventDefault();
               if (!staffImageData) {
                 notify('error', 'Add a profile image for this staff member.');
                 return;
               }
               if (selectedClassesForAdd.length === 0) {
                 notify('error', 'Select at least one class for this staff member.');
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
               } catch {
                 // The store displays the Firebase error and the form stays open.
               } finally { setIsSubmitting(false); }
             }} className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
                <input type="hidden" name="imageUrl" value={staffImageData} />
                
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
                <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
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
                        <input required name="nationalId" placeholder="63-XXXXXX-X-XX" className={googleInput} />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className={googleLabel}>Birth Date</label>
                      <input required type="date" name="dob" className={googleInput} />
                    </div>
                    <div className="space-y-2">
                      <label className={googleLabel}>Home Address</label>
                      <input required name="address" placeholder="Enter home address" className={googleInput} />
                    </div>
                  </div>
                </section>

                <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
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
                    <input required minLength={6} type="password" name="password" placeholder="At least 6 characters" className={googleInput} />
                    <p className="text-[11px] text-slate-400">Used for staff member login.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:col-span-2 xl:col-span-1">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-[15px] bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center text-[10px] font-bold">03</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">Work</h4>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="space-y-2">
                    <label className={googleLabel}>Job Role</label>
                    <select required name="position" className={`${googleInput} appearance-none cursor-pointer`}>
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
                
                <div className="sticky bottom-0 mx-auto flex max-w-7xl flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 text-center shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:flex-row sm:justify-between sm:px-5">
                  <p className="text-[11px] text-slate-400">The login and staff profile are saved together.</p>
                  <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-slate-950 sm:w-auto"
                  >
                    {isSubmitting ? <Loader2 size={22} className="animate-spin" /> : <>Save Staff Record <ChevronRight size={18}/></>}
                  </button>
                </div>
             </form>
          </div>
        </div>
      ), document.body)}
      {newStaffCropSource && (
        <ImageCropEditor
          source={newStaffCropSource}
          onCancel={() => setNewStaffCropSource('')}
          onApply={image => {
            setStaffImageData(image);
            setNewStaffCropSource('');
          }}
        />
      )}
    </div>
  );
};
