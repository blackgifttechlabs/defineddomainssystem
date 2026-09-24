import React, { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from 'firebase/firestore';
import type { Student } from '../../types';
import { findVerificationStudent, parseStudentLookup } from '../../utils/studentVerification';
import { ArrowRight, ArrowUpRight, BadgeCheck, Check, HelpCircle, Loader2, Printer, Repeat2, Search, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import { LostStudentHelp } from './LostStudentHelp';
import { verificationButton as button, verificationPrimary as primary } from './verificationStyles';
import { useStore } from '../../store/useStore';
import {
  IdentityCard,
  CARD_WIDTH,
  CARD_HEIGHT,
  LogoImg
} from '../common/IdentityCard';

const VerificationBaseUrl = 'https://defineddomains.org/';

export const StudentIdVerification: React.FC = () => {
  const { students } = useStore();
  const [searchInput, setSearchInput] = useState(() => new URLSearchParams(window.location.search).get('id-card') || '');
  const [submittedLookup, setSubmittedLookup] = useState(searchInput);
  const [showHelp, setShowHelp] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ lookup: string; student: Student | null; error: string }>({ lookup: '', student: null, error: '' });
  const [retryCount, setRetryCount] = useState(0);
  const [showingBack, setShowingBack] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [scale, setScale] = useState(1);

  const previewRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const activeLookupId = parseStudentLookup(submittedLookup);
  const cachedStudent = useMemo(() => findVerificationStudent(students, activeLookupId), [students, activeLookupId]);
  const resolved = lookupResult.lookup === activeLookupId;
  const student = cachedStudent || (resolved ? lookupResult.student : null);
  const lookupError = resolved ? lookupResult.error : '';

  useEffect(() => {
    if (!activeLookupId || cachedStudent) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const db = getFirestore();
        const normalize = (record: { id: string; data: () => unknown }): Student => {
          const data = record.data() as Student;
          return { ...data, firebaseUid: record.id, id: data.id || record.id,
            fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() };
        };
        let match: Student | null = null;
        // QR codes contain the document ID, so this works without loading the directory.
        if (!activeLookupId.includes('/')) {
          const record = await getDoc(doc(db, 'students', activeLookupId));
          if (record.exists()) match = normalize(record);
        }
        if (!match) {
          const records = await Promise.all([
            ['firebaseUid', activeLookupId],
            ['id', activeLookupId.toUpperCase()],
            ['fullName', activeLookupId],
          ].map(([field, value]) => getDocs(query(collection(db, 'students'), where(field, '==', value), limit(2)))));
          const unique = new Map(records.flatMap(snapshot => snapshot.docs.map(record => [record.id, normalize(record)] as const)));
          if (unique.size === 1) match = [...unique.values()][0];
        }
        if (!cancelled) setLookupResult({ lookup: activeLookupId, student: match, error: '' });
      } catch {
        if (!cancelled) setLookupResult({ lookup: activeLookupId, student: null,
          error: 'Student records could not be loaded. Check your connection and try again. If this continues, contact the school.' });
      }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [activeLookupId, cachedStudent, retryCount]);

  // Generate QR Code for the student card
  useEffect(() => {
    if (!student) {
      setQrDataUrl('');
      return;
    }
    const targetUrl = `${VerificationBaseUrl}?id-card=${encodeURIComponent(student.firebaseUid || student.id)}`;
    QRCode.toDataURL(targetUrl, {
      width: 260,
      margin: 1,
      color: { dark: '#0b1b36', light: '#ffffff' }
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [student]);

  // Calculate responsive scale for ID Card display
  useEffect(() => {
    const updateScale = () => {
      if (!previewRef.current) return;
      const containerWidth = previewRef.current.clientWidth - 16;
      setScale(Math.min(1, Math.max(0.1, containerWidth / CARD_WIDTH)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (previewRef.current) observer.observe(previewRef.current);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [student, showHelp]);

  const handlePrint = () => {
    window.print();
  };

  const isLoading = Boolean(activeLookupId) && !student && !resolved;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedLookup(searchInput);
    setLookupResult({ lookup: '', student: null, error: '' });
    setRetryCount(value => value + 1);
    setShowingBack(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-neutral-950 selection:bg-violet-100 selection:text-violet-950">
      <header className="border-b border-neutral-200 print:hidden">
        <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
          <a href="/" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-violet-600" aria-label="Defined Domains home">
            <img src={LogoImg} alt="" className="h-9 w-9 shrink-0 object-contain" />
            <div><p className="text-sm font-semibold tracking-tight sm:text-base">Defined Domains</p><p className="mt-0.5 text-[11px] text-neutral-500">Student verification</p></div>
          </a>
          {!showHelp && <button onClick={() => setShowHelp(true)} className={`${button} shrink-0 !px-3 sm:!px-4`}><HelpCircle size={16} /><span>Lost Student?</span></button>}
          {showHelp && <span className="text-xs text-neutral-400">Here to help</span>}
        </div>
      </header>
      <main className="flex-1">
        {showHelp ? <LostStudentHelp student={student} onBack={() => { setShowHelp(false); window.scrollTo(0, 0); }} /> : (
          <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-14">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
              <div><p className="mb-3 flex items-center gap-2 text-xs font-medium text-neutral-500"><ShieldCheck size={14} />DEFINED DOMAINS / IDENTITY</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Student ID verification</h1><p className="mt-3 max-w-lg text-sm leading-6 text-neutral-500">Confirm a student’s identity. Find support when it matters.</p></div>
              {student && <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"><Check size={13} />Verified student</span>}
            </div>
            {isLoading ? <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-neutral-200 p-8 text-center"><Loader2 size={24} className="animate-spin text-neutral-500" /><h2 className="mt-5 text-lg font-medium">Verifying student ID</h2><p className="mt-2 text-sm text-neutral-500">Checking the school’s student records…</p></div> : student ? (
              <div className="grid items-start gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
                <div className="space-y-5">
                  <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <div className="border-b border-neutral-200 p-6">
                      <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400">{student.imageUrl || student.idCardImageUrl ? <img src={student.imageUrl || student.idCardImageUrl} alt={student.fullName} className="h-full w-full object-cover" /> : <UserRound size={30} />}</div>
                      <h2 className="break-words text-2xl font-semibold leading-tight tracking-tight">{student.fullName}</h2><p className="mt-2 font-mono text-sm text-neutral-500">{student.id}</p>
                    </div>
                    <dl className="space-y-5 p-6 text-sm"><div className="flex items-center justify-between gap-3"><dt className="text-neutral-500">Status</dt><dd className="inline-flex items-center gap-1.5 font-medium text-emerald-700"><BadgeCheck size={15} />ID verified</dd></div><div className="flex items-start justify-between gap-3"><dt className="shrink-0 text-neutral-500">Class / Grade</dt><dd className="text-right font-medium">{student.assignedClass || 'Not assigned'}</dd></div><div className="flex items-start justify-between gap-3"><dt className="text-neutral-500">School</dt><dd className="text-right font-medium">Defined Domains<br /><span className="font-normal text-neutral-500">Inclusive School</span></dd></div></dl>
                  </section>
                  <section className="rounded-lg border border-neutral-200 bg-neutral-50 p-5 print:hidden"><HelpCircle size={19} className="mb-3 text-neutral-500" /><h2 className="text-sm font-semibold">Found a student who needs help?</h2><p className="mt-2 text-sm leading-6 text-neutral-500">Reach their parent or the school, and find your way to us.</p><button onClick={() => setShowHelp(true)} className={`${primary} mt-4 w-full`}>Lost Student? <ArrowUpRight size={16} /></button></section>
                </div>
                <section className="min-w-0 overflow-hidden rounded-lg border border-neutral-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4"><div><h2 className="text-sm font-medium">Official student card</h2><p className="mt-1 text-xs text-neutral-500">{showingBack ? 'Back' : 'Front'} side</p></div><div className="flex gap-2 print:hidden"><button onClick={() => setShowingBack(value => !value)} className={`${button} !px-3`}><Repeat2 size={15} />Flip card</button><button onClick={handlePrint} aria-label="Print student card" className={`${button} !px-3`}><Printer size={15} /><span className="hidden sm:inline">Print</span></button></div></div>
                  <div className="bg-neutral-50 px-2 py-6 sm:px-5 sm:py-10">
                    <div ref={previewRef} className="relative w-full overflow-hidden" style={{ height: CARD_HEIGHT * scale }}>
                      <div className="absolute left-1/2 top-0" style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center' }}><IdentityCard ref={cardRef} student={student} showingBack={showingBack} qrDataUrl={qrDataUrl} forceStatic /></div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 border-t border-neutral-200 p-5 text-xs leading-5 text-neutral-500"><ShieldCheck size={15} className="mt-0.5 shrink-0" /><p>This identity matches the school’s student records. Contact the school if any details appear incorrect.</p></div>
                </section>
              </div>
            ) : (
              <section className="mx-auto max-w-xl rounded-lg border border-neutral-200 p-6 sm:p-8">
                {activeLookupId ? <><ShieldAlert size={25} className="mb-5 text-neutral-500" /><h2 className="text-xl font-semibold tracking-tight">{lookupError ? 'Verification unavailable' : 'Student not found'}</h2><p role="status" className="mt-3 break-words text-sm leading-6 text-neutral-500">{lookupError || `“${activeLookupId}” could not uniquely identify a student. Scan the latest card, or try their full name.`}</p></> : <><Search size={25} className="mb-5 text-neutral-500" /><h2 className="text-xl font-semibold tracking-tight">Find a student</h2><p className="mt-3 text-sm leading-6 text-neutral-500">Enter a student ID, full name, or the link from their QR code.</p></>}
                <form onSubmit={submitSearch} className="mt-6"><label htmlFor="student-lookup" className="mb-2 block text-xs font-medium text-neutral-700">Student ID or full name</label><input id="student-lookup" value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="e.g. DD002" autoComplete="off" required className="min-h-12 w-full rounded-md border border-neutral-300 bg-white px-3 text-base outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-100 sm:text-sm" /><button type="submit" className={`${primary} mt-3 w-full`}>{lookupError ? 'Retry verification' : 'Verify student'}<ArrowRight size={16} /></button></form>
                <div className="mt-6 border-t border-neutral-200 pt-5"><button onClick={() => setShowHelp(true)} className="inline-flex min-h-11 items-center gap-2 text-sm text-neutral-600 hover:text-black">Need help? Contact the school <ArrowUpRight size={15} /></button></div>
              </section>
            )}
          </div>
        )}
      </main>
      <footer className="mt-6 border-t border-neutral-200 print:hidden"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-xs text-neutral-400 sm:px-8"><p>© {new Date().getFullYear()} Defined Domains Inclusive School</p><p>Masvingo, Zimbabwe</p></div></footer>
    </div>
  );
};
