import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, LocateFixed, X } from 'lucide-react';
import { verificationButton, verificationPrimary } from './verificationStyles';
export const LocationConsent: React.FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; element?.showModal();
    return () => { element?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, []);
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="location-title" aria-describedby="location-description" className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-neutral-200 bg-white p-0 text-neutral-950 shadow-xl backdrop:bg-black/40">
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-lg border border-violet-100 bg-violet-50 text-violet-700"><LocateFixed size={22} /></span><button onClick={onClose} aria-label="Close location request" className={`${verificationButton} !min-h-10 !p-2`}><X size={18} /></button></div>
      <h2 id="location-title" className="text-xl font-semibold tracking-tight">Let us guide you to school.</h2>
      <p id="location-description" className="mt-3 text-sm leading-6 text-neutral-600">We’d like to know your location so we can show you the route to the school. After you tap OK, your browser will ask you to allow location access.</p>
      <p className="mt-3 text-xs leading-5 text-neutral-500">Your location is used for this route. It isn’t saved to the student’s record.</p>
      <div className="mt-7 grid grid-cols-2 gap-3"><button onClick={onClose} className={verificationButton}>Not now</button><button autoFocus onClick={onConfirm} className={verificationPrimary}>OK, continue <ArrowUpRight size={16} /></button></div>
    </div>
  </dialog>;
};
