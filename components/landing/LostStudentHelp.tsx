import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, Building2, Mail, MapPin, Navigation, Phone, UserRound } from 'lucide-react';
import type { Student } from '../../types';
import { directionsUrl, phoneHref, schoolContact } from '../../utils/schoolContact';
import { verificationButton as button, verificationPrimary as primary } from './verificationStyles';

const SchoolRouteMap = lazy(() => import('./SchoolRouteMap').then(module => ({ default: module.SchoolRouteMap })));

export const LostStudentHelp: React.FC<{ student: Student | null; onBack: () => void }> = ({ student, onBack }) => {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); window.scrollTo(0, 0); }, []);
  return <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 sm:py-10">
    <button onClick={onBack} className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm text-neutral-500 hover:text-neutral-950 focus-visible:outline-violet-600"><ArrowLeft size={16} />Back to verification</button>
    <div className="mb-8 max-w-2xl"><p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-violet-700">Student support</p><h1 ref={heading} tabIndex={-1} className="text-3xl font-semibold tracking-tight outline-none sm:text-4xl">Help them get back safely.</h1><p className="mt-3 text-sm leading-6 text-neutral-500 sm:text-base">{student ? <>You’re helping <span className="font-medium text-neutral-900">{student.fullName}</span>. </> : ''}Contact a parent or the school, and get directions to our entrance.</p></div>
    <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center gap-2 text-xs font-medium text-neutral-500"><UserRound size={16} />PARENT / GUARDIAN</div><h2 className="break-words text-lg font-semibold tracking-tight">{student?.parentName || 'Parent contact'}</h2>
          {student?.parentPhone ? <><a href={phoneHref(student.parentPhone)} className="mt-2 block text-sm text-neutral-600">{student.parentPhone}</a><a className={`${primary} mt-5 w-full`} href={phoneHref(student.parentPhone)}><Phone size={15} />Call parent</a></> : <p className="mt-2 text-sm leading-6 text-neutral-500">{student ? 'No parent phone number is on this record. Please contact the school.' : 'Verify a student ID to see their parent’s contact details.'}</p>}
          {student?.parentEmail && <a className="mt-4 flex min-h-11 items-center gap-2 break-all text-sm text-neutral-600 hover:text-black" href={`mailto:${student.parentEmail}`}><Mail size={15} className="shrink-0" />{student.parentEmail}</a>}
        </section>
        <section className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6"><div className="mb-5 flex items-center gap-2 text-xs font-medium text-neutral-500"><Building2 size={16} />SCHOOL CONTACT</div><h2 className="text-lg font-semibold tracking-tight">Defined Domains</h2><p className="mt-1 text-sm text-neutral-500">Inclusive School</p><p className="mt-4 flex gap-2 text-sm leading-6 text-neutral-600"><MapPin size={16} className="mt-1 shrink-0" />{schoolContact.address}</p><a href={phoneHref(schoolContact.phone)} className={`${button} mt-5 w-full`}><Phone size={15} />{schoolContact.phone}</a><a className="mt-3 flex min-h-11 items-center gap-2 break-all text-sm text-neutral-600 hover:text-black" href={`mailto:${schoolContact.email}`}><Mail size={15} className="shrink-0" />{schoolContact.email}</a></section>
      </div>
      <section className="min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white" aria-labelledby="directions-title">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 p-5 sm:p-6"><div><h2 id="directions-title" className="text-lg font-semibold tracking-tight">Your way to school</h2><p className="mt-1 text-sm text-neutral-500">24 Eliot Street · Rhodene, Masvingo</p></div><Navigation size={20} className="text-violet-600" /></div>
        {schoolContact.coordinates ? <Suspense fallback={<div className="flex h-[340px] items-center justify-center bg-neutral-50 text-sm text-neutral-500">Loading satellite map…</div>}><SchoolRouteMap destination={schoolContact.coordinates} /></Suspense> : <div className="flex min-h-[300px] flex-col items-center justify-center bg-neutral-50 px-6 text-center"><MapPin size={28} className="mb-4 text-neutral-400" /><p className="text-sm font-medium">24 Eliot Street, Rhodene</p><p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">Contact the school to confirm the entrance, or open the address in Google Maps.</p></div>}
        <div className="border-t border-neutral-200 p-5 sm:p-6"><a href={directionsUrl(schoolContact.coordinates || schoolContact.address)} target="_blank" rel="noopener noreferrer" className={`${primary} w-full`}>Get directions to school <ArrowUpRight size={16} /></a></div>
      </section>
    </div>
  </div>;
};
