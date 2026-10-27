import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Loader2,
  Receipt,
  Wallet,
  X,
} from 'lucide-react';
import { PaymentRecord } from '../../types';
import {
  generateReceiptDownload,
  RECEIPT_DOWNLOAD_COUNTDOWN_SECONDS,
  RECEIPT_DOWNLOAD_LOADING_TEXT,
  ReceiptDownloadFormat,
} from '../../reports/receipt_generator';

const PAYMENT_API_BASE_URL = ((import.meta as any).env?.VITE_PAYMENT_API_BASE_URL || 'https://defined-domain-payments.vercel.app').replace(/\/$/, '');

const paymentBrands = [
  { name: 'EcoCash', logo: 'https://i.ibb.co/7NQSc15p/ecocash.png' },
  { name: "O’mari", logo: 'https://i.ibb.co/BDp0pNV/omari.png' },
  { name: 'Visa / Mastercard', logo: 'https://i.ibb.co/tw59PtJJ/visamastercard.png' },
];

const currency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const SchoolFees: React.FC = () => {
  const { user, students, parents, settings, payments } = useStore();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(settings.currentTerm || 'Term 1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zbPopup, setZbPopup] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [pendingCheckout, setPendingCheckout] = useState<{ studentId: string; amount: number; term: string; startedAt: number; knownIds: string[] } | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('parent-pending-checkout') || 'null'); } catch { return null; }
  });
  const [receipt, setReceipt] = useState<{ amount: number; reference: string; timestamp: string; term: string } | null>(null);
  const [downloadPayment, setDownloadPayment] = useState<PaymentRecord | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<ReceiptDownloadFormat | null>(null);
  const [downloadCountdown, setDownloadCountdown] = useState(RECEIPT_DOWNLOAD_COUNTDOWN_SECONDS);
  const [downloadStep, setDownloadStep] = useState<'choose' | 'loading'>('choose');

  const studentProfile = useMemo(() => {
    if (user?.role === 'STUDENT') return students.find(s => s.firebaseUid === user.id);
    if (user?.role === 'PARENT') {
      const parent = parents.find(p => p.firebaseUid === user.id || p.id === user.id);
      return parent ? students.find(s => s.id === parent.studentId) : null;
    }
    return null;
  }, [user, students, parents]);

  const parentProfile = useMemo(() => {
    if (user?.role !== 'PARENT') return null;
    return parents.find(p => p.firebaseUid === user.id || p.id === user.id) || null;
  }, [user, parents]);

  const studentPayments = useMemo(
    () => studentProfile
      ? payments.filter(p => p.studentId === studentProfile.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      : [],
    [payments, studentProfile]
  );

  const totalFees = settings.feesAmount || 0;
  const paidFees = studentProfile?.totalPaid || 0;
  const balance = Math.max(0, totalFees - paidFees);
  const paidRatio = totalFees > 0 ? paidFees / totalFees : 0;
  const amount = Number(paymentAmount);

  const validateAmount = () => {
    if (!studentProfile || !studentProfile.firebaseUid) return false;
    if (!Number.isFinite(amount) || amount <= 0 || Math.abs(Math.round(amount * 100) - amount * 100) > 0.000001) return false;
    if (balance <= 0 || amount > balance) return false;
    return true;
  };

  useEffect(() => {
    if (!pendingCheckout || pendingCheckout.studentId !== studentProfile?.id) return;
    const confirmed = studentPayments.find(payment => !payment.isMock &&
      !pendingCheckout.knownIds.includes(payment.id) && payment.amount === pendingCheckout.amount &&
      new Date(payment.timestamp).getTime() >= pendingCheckout.startedAt);
    if (!confirmed) return;
    setReceipt({ amount: confirmed.amount, reference: confirmed.reference || confirmed.id, timestamp: confirmed.timestamp, term: pendingCheckout.term });
    sessionStorage.removeItem('parent-pending-checkout');
    setPendingCheckout(null);
    setPaymentAmount('');
    setReviewOpen(false);
  }, [pendingCheckout, studentPayments, studentProfile?.id]);

  useEffect(() => {
    if (!reviewOpen || isProcessing) return;
    const handleEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setReviewOpen(false); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [reviewOpen, isProcessing]);

  const closeDownloadModal = () => {
    setDownloadPayment(null);
    setDownloadFormat(null);
    setDownloadCountdown(RECEIPT_DOWNLOAD_COUNTDOWN_SECONDS);
    setDownloadStep('choose');
    setIsGenerating(false);
  };

  const openDownloadModal = (payment: PaymentRecord) => {
    setDownloadPayment(payment);
    setDownloadFormat(null);
    setDownloadCountdown(RECEIPT_DOWNLOAD_COUNTDOWN_SECONDS);
    setDownloadStep('choose');
  };

  const startReceiptDownload = (format: ReceiptDownloadFormat) => {
    setDownloadFormat(format);
    setDownloadCountdown(RECEIPT_DOWNLOAD_COUNTDOWN_SECONDS);
    setDownloadStep('loading');
  };

  useEffect(() => {
    if (downloadStep !== 'loading' || !downloadPayment || !downloadFormat || !studentProfile) return;

    if (downloadCountdown > 0) {
      const timer = window.setTimeout(() => setDownloadCountdown(current => current - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    const runDownload = async () => {
      setIsGenerating(true);
      try { await generateReceiptDownload(downloadFormat, {
        payment: downloadPayment,
        student: studentProfile,
        parent: parentProfile,
        term: selectedTerm,
        totalFees,
        paidFees,
        balance,
      });
      if (!cancelled) closeDownloadModal();
      } catch {
        if (!cancelled) { closeDownloadModal(); setCheckoutError('The receipt could not be downloaded. Please try again.'); setZbPopup(true); }
      }
    };

    runDownload();
    return () => {
      cancelled = true;
    };
  }, [balance, downloadCountdown, downloadFormat, downloadPayment, downloadStep, paidFees, parentProfile, selectedTerm, studentProfile, totalFees]);

  const handleZbCheckout = async () => {
    if (!validateAmount() || !studentProfile) return;
    setIsProcessing(true);
    setCheckoutError('');
    try {
      const response = await fetch(`${PAYMENT_API_BASE_URL}/api/initiate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          term: selectedTerm,
          studentId: studentProfile.id,
          studentName: studentProfile.fullName,
          studentFirebaseUid: studentProfile.firebaseUid,
          parentUserId: user?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.paymentUrl) {
        throw new Error('Checkout is currently unavailable. Please try again or contact the school office.');
      }

      const checkoutUrl = new URL(data.paymentUrl);
      if (checkoutUrl.protocol !== 'https:') throw new Error('The checkout link could not be opened securely. Please contact the school office.');
      const pending = { studentId: studentProfile.id, amount, term: selectedTerm, startedAt: Date.now(), knownIds: studentPayments.map(payment => payment.id) };
      sessionStorage.setItem('parent-pending-checkout', JSON.stringify(pending));
      setPendingCheckout(pending);
      window.location.assign(checkoutUrl.href);
    } catch (error) {
      setReviewOpen(false);
      setCheckoutError(error instanceof Error ? error.message : 'Unable to connect to checkout. Please try again.');
      setZbPopup(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!studentProfile) {
    return <div className="h-[70svh] grid place-items-center text-xs font-semibold uppercase tracking-widest text-[#3b1764]">Loading fees…</div>;
  }

  return (
    <div className="fees-layout space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fees</h1>
          <p className="text-sm font-medium text-slate-500">{studentProfile.fullName}</p>
        </div>
        <button
          onClick={() => studentPayments[0] && openDownloadModal(studentPayments[0])}
          aria-label="Download latest receipt"
          disabled={studentPayments.length === 0}
          className="h-11 w-11 rounded-full bg-white  grid place-items-center text-[#3b1764] disabled:opacity-40"
        >
          <Download size={17} />
        </button>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 text-neutral-950 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Paid</p>
            <Wallet size={17} />
          </div>
          <h2 className="mt-4 text-4xl font-semibold">{currency(paidFees)}</h2>
          <p className="text-xs font-medium opacity-90">of {currency(totalFees)} for {selectedTerm}</p>
          <div className="mt-4 h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#3b1764]" style={{ width: `${Math.min(100, Math.round(paidRatio * 100))}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold">
            <span>{Math.round(paidRatio * 100)}% complete</span>
            <span>Balance {currency(balance)}</span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4  space-y-4">
        <div><h2 className="text-sm font-semibold">Make a payment</h2></div>
        <ol aria-label="Payment steps" className="flex items-center gap-2 text-xs font-medium text-slate-400"><li className="text-violet-700">1. Amount</li><ChevronRight size={12} /><li>2. Review</li><ChevronRight size={12} /><li>3. Confirmation</li></ol>
        <div className="grid grid-cols-3 gap-2">
          {['Term 1', 'Term 2', 'Term 3'].map(term => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`h-10 rounded-2xl text-xs font-semibold transition-all ${
                selectedTerm === term ? 'bg-[#3b1764] text-white ' : 'bg-[#f9f9fa] text-slate-500'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="payment-amount" className="text-xs font-semibold text-slate-500">Amount (USD)</label>
          <div className="mt-2 flex items-center gap-2 rounded-[22px] bg-slate-50 px-4 py-3 border border-slate-200">
            <span className="text-lg font-semibold text-[#3b1764]">$</span>
            <input
              id="payment-amount"
              min="0.01"
              max={balance}
              step="0.01"
              type="number"
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              placeholder="0"
              className="min-w-0 flex-1 bg-transparent outline-none text-2xl font-semibold text-slate-950 placeholder:text-slate-300"
            />
          </div>
        </div>

        <p className="text-sm text-slate-500">{balance === 0 ? 'Your fees are fully paid.' : `Outstanding balance: ${currency(balance)}`}</p>
        {paymentAmount && !validateAmount() && <p role="alert" className="text-xs text-rose-600">Enter an amount up to your balance, with no more than two decimal places.</p>}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"><div className="flex items-center gap-2"><span aria-label="ZB" className="rounded-md bg-[#007749] px-2 py-1 text-lg font-semibold italic text-white">ZB</span><div><p className="text-xs font-medium">ZB online checkout</p><p className="text-xs text-slate-500">Payment options available at checkout</p></div></div><CreditCard size={20} className="text-slate-400" /></div>
        <div className="flex flex-wrap items-center gap-2" aria-label="School payment options">
          {paymentBrands.map(brand => <div key={brand.name} className="flex h-10 items-center gap-2 rounded-lg border border-slate-100 px-2"><img src={brand.logo} alt="" className="h-5 w-9 object-contain" /><span className="text-xs font-semibold text-slate-600">{brand.name}</span></div>)}
        </div>
        <p className="text-xs text-slate-400">The provider displays the available methods and any charges before you authorise payment.</p>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => setReviewOpen(true)}
            disabled={isProcessing || !validateAmount()}
            className="h-12 rounded-xl bg-[#3b1764] text-white text-sm font-semibold flex items-center justify-center gap-2  disabled:opacity-45 transition-all active:scale-[0.98]"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={15} />}
            Review payment <ChevronRight size={14} />
          </button>
        </div>
      </section>

      <section className="payment-history rounded-xl border border-slate-200 bg-white p-4 ">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Receipt size={15} className="text-[#3b1764]" />
            <h2 className="text-sm font-semibold">Recent payments</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">{studentPayments.length} total</span>
        </div>
        <div className="space-y-2">
          {studentPayments.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-xs font-medium text-slate-400">No payment records yet.</div>
          ) : studentPayments.slice(0, 5).map(payment => (
            <div key={payment.id} className="rounded-2xl bg-slate-50 px-3 py-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white grid place-items-center text-[#3b1764] shadow-sm">
                <Receipt size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{payment.method}</p>
                <span className={`text-[9px] font-medium ${payment.isMock ? 'text-amber-600' : 'text-emerald-600'}`}>{payment.isMock ? 'Not confirmed' : 'Successful'}</span>
                <p className="text-[9px] font-medium text-slate-400">{new Date(payment.timestamp).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{currency(payment.amount)}</span>
                <button
                  onClick={() => openDownloadModal(payment)}
                  className="h-8 w-8 rounded-full bg-white text-[#3b1764] grid place-items-center shadow-sm active:scale-95 transition-transform"
                  title="Download receipt"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {pendingCheckout && !receipt && <div role="status" className="lg:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900"><p className="font-medium">Awaiting payment confirmation</p><p className="mt-1">If you completed checkout, your payment will appear once confirmed. Returning from checkout alone does not confirm payment.</p><button onClick={() => { sessionStorage.removeItem('parent-pending-checkout'); setPendingCheckout(null); }} className="mt-2 font-medium underline">Dismiss</button></div>}
      {reviewOpen && <div className="fixed inset-0 z-[1100] grid place-items-center bg-slate-950/50 backdrop-blur-sm p-5"><div role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="flex justify-between items-center"><h2 id="review-title" className="font-semibold text-lg">Review payment</h2><button disabled={isProcessing} onClick={() => setReviewOpen(false)} aria-label="Close review"><X size={20} /></button></div><p className="mt-2 text-xs text-slate-500">Step 2 of 3 · Confirm the details below</p><div className="my-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm"><div className="flex justify-between gap-4"><span className="text-slate-500">Student</span><strong className="text-right">{studentProfile.fullName}</strong></div><div className="flex justify-between"><span className="text-slate-500">Term</span><strong>{selectedTerm}</strong></div><div className="flex justify-between"><span className="text-slate-500">Payment provider</span><strong>ZB</strong></div><div className="flex justify-between border-t pt-3"><span className="text-slate-500">Amount · USD</span><strong>{currency(amount)}</strong></div></div><p className="text-xs text-slate-500 mb-4">You will continue to ZB to authorise payment. Confirmation appears after the payment is recorded.</p><button disabled={isProcessing || !validateAmount()} onClick={handleZbCheckout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 p-3 text-sm font-medium text-white disabled:opacity-50">{isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}{isProcessing ? 'Connecting to ZB…' : 'Continue to ZB'}</button></div></div>}
      {zbPopup && (
        <div className="fixed left-5 right-5 top-5 z-[1200] max-w-sm mx-auto rounded-[26px] bg-white/85 backdrop-blur-2xl border border-white  p-4 animate-parent-tab">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-rose-100 grid place-items-center text-rose-600 shrink-0">
              <AlertCircle size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Unable to complete request</p>
              <p className="text-sm font-medium text-slate-500 mt-0.5">{checkoutError}</p>
            </div>
            <button onClick={() => setZbPopup(false)} className="text-slate-400"><X size={16} /></button>
          </div>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-[1100] bg-[#2e1065]/55 backdrop-blur-xl grid place-items-center p-5">
          <div className="w-full max-w-sm rounded-[34px] bg-white p-6 text-center  animate-parent-tab">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 grid place-items-center text-emerald-600 animate-receipt-tick">
              <CheckCircle2 size={42} strokeWidth={2.8} />
            </div>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">Payment successful</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">Your payment has been recorded by the school.</p>
            <div className="mt-5 rounded-xl bg-[#f9f9fa] p-4 text-left space-y-3">
              <div className="flex justify-between gap-4 text-xs"><span className="font-medium text-slate-500">Student</span><span className="font-semibold text-right">{studentProfile.fullName}</span></div>
              <div className="flex justify-between gap-4 text-xs"><span className="font-medium text-slate-500">Parent</span><span className="font-semibold text-right">{parentProfile?.name || user?.name}</span></div>
              <div className="flex justify-between gap-4 text-xs"><span className="font-medium text-slate-500">Term</span><span className="font-semibold">{receipt.term}</span></div>
              <div className="flex justify-between gap-4 text-xs"><span className="font-medium text-slate-500">Amount</span><span className="font-semibold">{currency(receipt.amount)}</span></div>
              <div className="flex justify-between gap-4 text-xs"><span className="font-medium text-slate-500">Receipt</span><span className="font-semibold">{receipt.reference}</span></div>
            </div>
            <button onClick={() => setReceipt(null)} className="mt-5 h-12 w-full rounded-xl bg-[#3b1764] text-white text-sm font-semibold ">Done</button>
          </div>
        </div>
      )}

      {downloadPayment && (
        <div className="fixed inset-0 z-[1150] bg-[#2e1065]/45 backdrop-blur-xl grid place-items-center p-5">
          <div className="w-full max-w-xs rounded-[30px] bg-white p-5  animate-parent-tab">
            {downloadStep === 'choose' ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#3b1764] uppercase tracking-widest">Download receipt</p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight">{currency(downloadPayment.amount)}</h3>
                    <p className="text-sm font-medium text-slate-500">{new Date(downloadPayment.timestamp).toLocaleDateString()}</p>
                  </div>
                  <button onClick={closeDownloadModal} className="h-8 w-8 rounded-full bg-[#f9f9fa] text-slate-400 grid place-items-center">
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => startReceiptDownload('pdf')}
                    className="h-20 rounded-xl bg-[#3b1764] text-white flex flex-col items-center justify-center gap-2 text-sm font-semibold  active:scale-[0.98] transition-transform"
                  >
                    <Receipt size={18} />
                    PDF
                  </button>
                  <button
                    onClick={() => startReceiptDownload('image')}
                    className="h-20 rounded-xl bg-[#f2e8ff] text-[#3b1764] flex flex-col items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform"
                  >
                    <Download size={18} />
                    Image
                  </button>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="relative mx-auto h-24 w-24 rounded-full grid place-items-center">
                  <div className="absolute inset-0 rounded-full border-[7px] border-[#efe3ff]" />
                  <div className="absolute inset-0 rounded-full border-[7px] border-[#3b1764] border-t-transparent animate-spin" />
                  <span className="relative text-3xl font-semibold text-[#3b1764]">{downloadCountdown}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{RECEIPT_DOWNLOAD_LOADING_TEXT}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500">{downloadCountdown} second{downloadCountdown === 1 ? '' : 's'}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Preparing {downloadFormat === 'pdf' ? 'PDF' : 'image'} receipt
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
