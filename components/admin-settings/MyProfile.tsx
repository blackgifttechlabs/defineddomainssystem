
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Save, Loader2, User } from 'lucide-react';

export const MyProfile: React.FC = () => {
  const { user, updateUserProfile } = useStore();
  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const borderStyle = "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateUserProfile({ name: newName, password: newPassword || undefined });
    setNewPassword('');
    setProfileSaving(false);
  };

  return (
    <div className="p-5 sm:p-6 max-w-2xl animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-lg bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold mb-3 shadow-sm uppercase border-4 border-white dark:border-slate-800">{user?.name?.[0]}</div>
          <h3 className="text-lg font-semibold dark:text-white tracking-tighter">{user?.name}</h3>
          <p className="text-[10px] font-semibold tracking-wide text-slate-900 dark:text-white mt-3">Role: {user?.role}</p>
        </div>
        <div className="space-y-5">
          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-slate-900 dark:text-white tracking-widest ml-1">Your Name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg font-semibold text-sm text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all `} />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-semibold text-slate-900 dark:text-white tracking-widest ml-1">Update Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password..." className={`w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border ${borderStyle} rounded-lg font-semibold text-sm text-black dark:text-white outline-none focus:bg-white dark:focus:bg-slate-800 transition-all `} />
          </div>
          <button type="submit" disabled={profileSaving} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold tracking-wide text-[10px] shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50">
            {profileSaving ? <Loader2 className="animate-spin mx-auto" size={20} /> : <><Save size={20} className="inline mr-3" /> Save Profile</>}
          </button>
        </div>
      </form>
    </div>
  );
};
