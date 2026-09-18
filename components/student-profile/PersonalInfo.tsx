import React, { useState } from 'react';
import { Student, Staff } from '../../types';
import { Camera, ImagePlus, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { processStudentImage } from '../../utils/imageProcessor';

interface Props {
  student: Student;
  isEditing: boolean;
  editForm: Partial<Student>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Student>>>;
  staff: Staff[];
  settings: any;
  isAdmin: boolean;
}

const RecordSection = ({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) => (
  <section className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <header className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5 dark:border-slate-800 dark:bg-slate-800/50">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{eyebrow}</p>
      <h3 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
    </header>
    {children}
  </section>
);

const InfoField = ({
  label,
  value,
  field,
  isEditing,
  editForm,
  setEditForm,
  options
}: {
  label: string;
  value?: string | number;
  field?: keyof Student;
  isEditing: boolean;
  editForm: Partial<Student>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<Student>>>;
  options?: any[];
}) => {
  return (
    <div className="min-w-0 px-4 py-4 sm:px-5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
        {label}
      </p>
      {isEditing && field ? (
        options ? (
          <select
            value={(editForm as any)[field] || ''}
            onChange={e => {
              const val = e.target.value;
              setEditForm(prev => ({ ...prev, [field]: val }));
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Select...</option>
            {options.map((opt: any) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={(editForm as any)[field] !== undefined ? (editForm as any)[field] : (value || '')}
            onChange={e => {
              const val = e.target.value;
              setEditForm(prev => ({ ...prev, [field]: val }));
            }}
            placeholder={`Enter ${label.toLowerCase()}...`}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        )
      ) : (
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={String(value || 'Not recorded')}>
          {value || 'Not recorded'}
        </p>
      )}
    </div>
  );
};

export const PersonalInfo: React.FC<Props> = ({
  student,
  isEditing,
  editForm,
  setEditForm,
  staff,
  settings,
  isAdmin
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [photoMode, setPhotoMode] = useState<'original' | 'remove-bg' | 'studio-white'>('original');
  const [rawFile, setRawFile] = useState<File | null>(null);

  const handlePhotoSelect = async (file?: File, mode: 'original' | 'remove-bg' | 'studio-white' = photoMode) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await processStudentImage(file, {
        maxDimension: 700,
        quality: 0.85,
        mode: mode,
      });
      setEditForm(prev => ({
        ...prev,
        imageUrl: res.base64,
        idCardImageUrl: res.base64,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate approximate age from DOB
  const calculateAge = (dobString?: string) => {
    if (!dobString) return '---';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return dobString;
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}Y ${months}M`;
  };

  const assignedStaffMember = staff.find(s => s.id === student.assignedStaffId);

  return (
    <div className="grid w-full grid-cols-1 items-start gap-5 animate-in fade-in duration-300 xl:grid-cols-2">
      <RecordSection eyebrow="Student record" title="Identity information">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <div className="relative w-16 h-16 rounded-full border border-slate-200 dark:border-slate-700 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 overflow-hidden flex items-center justify-center font-bold text-lg shrink-0">
            {(editForm.imageUrl || editForm.idCardImageUrl || student.imageUrl || student.idCardImageUrl) ? (
              <img
                src={editForm.imageUrl || editForm.idCardImageUrl || student.imageUrl || student.idCardImageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              (student.fullName || 'S')[0]
            )}
            {isEditing && isProcessing && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Student Portrait & ID Photo</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Stored as Base64 in database. Applies to ID cards, directory, and tables.</p>
            {isEditing && isAdmin && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[8px] text-[11px] font-bold cursor-pointer transition-all shadow-sm">
                  <ImagePlus size={13} />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setRawFile(f);
                        handlePhotoSelect(f, photoMode);
                      }
                    }}
                  />
                </label>
                {rawFile && (
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[8px] p-0.5">
                    <button
                      type="button"
                      onClick={() => { setPhotoMode('original'); handlePhotoSelect(rawFile, 'original'); }}
                      className={`px-2 py-1 text-[10px] font-bold rounded-[6px] ${photoMode === 'original' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPhotoMode('remove-bg'); handlePhotoSelect(rawFile, 'remove-bg'); }}
                      className={`px-2 py-1 text-[10px] font-bold rounded-[6px] flex items-center gap-1 ${photoMode === 'remove-bg' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      <Wand2 size={10} /> Remove BG
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPhotoMode('studio-white'); handlePhotoSelect(rawFile, 'studio-white'); }}
                      className={`px-2 py-1 text-[10px] font-bold rounded-[6px] flex items-center gap-1 ${photoMode === 'studio-white' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      <Sparkles size={10} /> Studio White
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-2 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(even)]:border-slate-100 sm:dark:[&>*:nth-child(even)]:border-slate-800">
          <InfoField
            label="First Name"
            value={student.firstName || student.fullName.split(' ')[0]}
            field="firstName"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
          <InfoField
            label="Last Name"
            value={student.lastName || student.fullName.split(' ').slice(1).join(' ')}
            field="lastName"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
          <InfoField
            label="Date of Birth"
            value={student.dob || '---'}
            field="dob"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
          <InfoField
            label="Age"
            value={calculateAge(student.dob)}
            isEditing={false}
            editForm={editForm}
            setEditForm={setEditForm}
          />
          <InfoField
            label="Gender"
            value={student.gender || 'Not specified'}
            field="gender"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            options={['Male', 'Female']}
          />
          <InfoField
            label="Enrollment Date"
            value={student.enrollmentDate}
            field="enrollmentDate"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
        </div>
      </RecordSection>

      <RecordSection eyebrow="Family record" title="Guardian contact">
        <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-2 sm:[&>*:nth-child(even)]:border-l sm:[&>*:nth-child(even)]:border-slate-100 sm:dark:[&>*:nth-child(even)]:border-slate-800">
          <InfoField
            label="Guardian Name"
            value={student.parentName || 'Parent'}
            field="parentName"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
          <InfoField
            label="Phone Number"
            value={student.parentPhone}
            field="parentPhone"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
          <InfoField
            label="Email Address"
            value={student.parentEmail}
            field="parentEmail"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
          <InfoField
            label="Home Address"
            value={student.homeAddress}
            field="homeAddress"
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
        </div>
      </RecordSection>

      <div className="xl:col-span-2">
        <RecordSection eyebrow="School record" title="Placement and support">
          <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0 lg:[&>*+*]:border-l lg:[&>*+*]:border-slate-100 lg:dark:[&>*+*]:border-slate-800">
            <InfoField label="Classroom" value={student.assignedClass || 'General'} field="assignedClass" isEditing={isEditing} editForm={editForm} setEditForm={setEditForm} options={settings?.classes || []} />
            <InfoField label="Assigned Specialist" value={assignedStaffMember?.fullName || 'Not assigned'} field="assignedStaffId" isEditing={isEditing && isAdmin} editForm={editForm} setEditForm={setEditForm} options={staff.map(s => ({ value: s.id, label: s.fullName }))} />
            <InfoField label="Student ID" value={`#${student.id}`} isEditing={false} editForm={editForm} setEditForm={setEditForm} />
            <InfoField label="Status" value="Active" isEditing={false} editForm={editForm} setEditForm={setEditForm} />
          </div>
        </RecordSection>
      </div>
    </div>
  );
};
