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
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
            {/* Header: Student ID verification + Valid badge */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                Student ID verification
              </h1>
              {student && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                  <Check size={14} className="stroke-[2.5]" />
                  ID is Valid
                </span>
              )}
            </div>

            {isLoading ? (
              <div role="status" className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-neutral-200 p-8 text-center">
                <Loader2 size={24} className="animate-spin text-neutral-500" />
                <h2 className="mt-4 text-base font-semibold text-neutral-800">Verifying student ID...</h2>
              </div>
            ) : student ? (
              <div className="space-y-6">
                {/* Box with image and details */}
                <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6 shadow-sm">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-400">
                    {student.imageUrl || student.idCardImageUrl ? (
                      <img src={student.imageUrl || student.idCardImageUrl} alt={student.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <UserRound size={36} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="truncate text-xl font-bold text-neutral-900 sm:text-2xl">{student.fullName}</h2>
                    <p className="mt-1 font-mono text-sm font-semibold text-violet-600">ID: {student.id}</p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
                      <div><span className="text-neutral-400">Class: </span><span className="font-medium text-neutral-800">{student.assignedClass || 'Not assigned'}</span></div>
                      <div><span className="text-neutral-400">School: </span><span className="font-medium text-neutral-800">Defined Domains Inclusive School</span></div>
                    </div>
                  </div>
                </div>

                {/* The ID Card Preview */}
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 print:hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Student Card ({showingBack ? 'Back' : 'Front'})</span>
                    <div className="flex gap-2">
                      <button onClick={() => setShowingBack(value => !value)} className={`${button} !py-1.5 !px-3 text-xs`}>
                        <Repeat2 size={14} />Flip card
                      </button>
                      <button onClick={handlePrint} className={`${button} !py-1.5 !px-3 text-xs`}>
                        <Printer size={14} />Print
                      </button>
                    </div>
                  </div>
                  <div className="bg-neutral-50 px-3 py-6 sm:px-6 sm:py-8">
                    <div ref={previewRef} className="relative w-full overflow-hidden" style={{ height: CARD_HEIGHT * scale }}>
                      <div className="absolute left-1/2 top-0" style={{ width: CARD_WIDTH, height: CARD_HEIGHT, transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'top center' }}>
                        <IdentityCard ref={cardRef} student={student} showingBack={showingBack} qrDataUrl={qrDataUrl} forceStatic />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom button for lost student */}
                <div className="pt-2 print:hidden">
                  <button onClick={() => setShowHelp(true)} className={`${primary} w-full justify-center !py-3.5 text-sm`}>
                    <HelpCircle size={17} />
                    Lost Student? Get Help & Directions
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <section className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
                {activeLookupId ? (
                  <>
                    <ShieldAlert size={26} className="mb-4 text-amber-500" />
                    <h2 className="text-lg font-bold text-neutral-900">{lookupError ? 'Verification unavailable' : 'Student not found'}</h2>
                    <p role="status" className="mt-2 text-sm text-neutral-500 leading-relaxed">
                      {lookupError || `“${activeLookupId}” could not be found. Please check the ID or scan again.`}
                    </p>
                  </>
                ) : (
                  <>
                    <Search size={26} className="mb-4 text-neutral-400" />
                    <h2 className="text-lg font-bold text-neutral-900">Find a student</h2>
                    <p className="mt-1 text-sm text-neutral-500">Enter a student ID or full name.</p>
                  </>
                )}
                <form onSubmit={submitSearch} className="mt-5">
                  <input
                    id="student-lookup"
                    value={searchInput}
                    onChange={event => setSearchInput(event.target.value)}
                    placeholder="e.g. DD002"
                    autoComplete="off"
                    required
                    className="min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  />
                  <button type="submit" className={`${primary} mt-3 w-full justify-center !py-2.5`}>
                    {lookupError ? 'Retry verification' : 'Verify student'}
                    <ArrowRight size={15} />
                  </button>
                </form>
                <div className="mt-5 border-t border-neutral-100 pt-4 text-center">
                  <button onClick={() => setShowHelp(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black">
                    <HelpCircle size={14} /> Need help? Lost student support
                  </button>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <footer className="mt-6 border-t border-neutral-200 print:hidden"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-6 text-xs text-neutral-400 sm:px-8"><p>© {new Date().getFullYear()} Defined Domains Inclusive School</p><p>Masvingo, Zimbabwe</p></div></footer>
    </div>
  );
};
