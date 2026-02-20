import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Upload, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface BookingFlowProps {
  lang: 'ar' | 'en';
  selectedTicket: 'vip' | 'standard';
  onClose: () => void;
}

const AR = (lang: 'ar' | 'en') => lang === 'ar' ? 'Cairo, sans-serif' : "'Cormorant Garamond', serif";

function genBookingId() {
  return `RT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function validate(formData: { name: string; phone: string; email: string }) {
  const errors: Record<string, string> = {};
  if (formData.name.trim().length < 2) errors.name = 'name';
  if (!/^(01)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = 'phone';
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'email';
  return errors;
}

export function BookingFlow({ lang, selectedTicket, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bookingId] = useState(genBookingId);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const isVip = selectedTicket === 'vip';

  const content = {
    ar: {
      stepLabels: ['التذكرة', 'بياناتك', 'الدفع'],
      vipName: 'VIP Signature', stdName: 'Classic Ticket',
      vipPrice: '500 جنيه', stdPrice: '350 جنيه',
      ticketLabel: 'التذكرة المختارة', priceLabel: 'السعر',
      name: 'الاسم الكامل', namePh: 'أدخل اسمك كاملاً',
      phone: 'رقم الهاتف', phonePh: '01XXXXXXXXX',
      email: 'البريد الإلكتروني', emailPh: 'example@email.com',
      emailOpt: 'اختياري',
      next: 'التالي', back: 'رجوع',
      payTitle: 'تعليمات الدفع',
      payDesc: 'حوّل المبلغ إلى أحد الحسابات التالية ثم ارفع إيصال التحويل',
      vodafone: 'فودافون كاش', instapay: 'إنستاباي',
      copy: 'نسخ', copied: 'تم ✓',
      uploadLabel: 'ارفع إيصال الدفع',
      dragText: 'أو اسحب الملف هنا',
      fileHint: 'JPG · PNG · PDF · حتى 10MB',
      confirm: 'تأكيد الحجز',
      confirmed: 'تم تأكيد حجزك!',
      bookingNo: 'رقم الحجز',
      thanks: 'شكراً لاختيارك روح الطرب — نراك قريباً ✨',
      close: 'إغلاق',
      uploaded: 'تم رفع الإيصال ✓',
      errs: {
        name: 'الاسم يجب أن يحتوي على حرفين على الأقل',
        phone: 'رقم يبدأ بـ 01 ومكون من 11 رقم',
        email: 'بريد إلكتروني غير صحيح',
        receipt: 'ارفع إيصال الدفع أولاً',
        size: 'حجم الملف يتجاوز 10MB',
        type: 'نوع الملف غير مدعوم',
      },
    },
    en: {
      stepLabels: ['Ticket', 'Details', 'Payment'],
      vipName: 'VIP Signature', stdName: 'Classic Ticket',
      vipPrice: 'EGP 500', stdPrice: 'EGP 350',
      ticketLabel: 'Selected Ticket', priceLabel: 'Price',
      name: 'Full Name', namePh: 'Enter your full name',
      phone: 'Phone Number', phonePh: '01XXXXXXXXX',
      email: 'Email Address', emailPh: 'example@email.com',
      emailOpt: 'optional',
      next: 'Next', back: 'Back',
      payTitle: 'Payment Instructions',
      payDesc: 'Transfer the amount to one of the accounts below, then upload your receipt',
      vodafone: 'Vodafone Cash', instapay: 'InstaPay',
      copy: 'Copy', copied: 'Copied ✓',
      uploadLabel: 'Upload Payment Receipt',
      dragText: 'or drag & drop here',
      fileHint: 'JPG · PNG · PDF · up to 10MB',
      confirm: 'Confirm Booking',
      confirmed: 'Booking Confirmed!',
      bookingNo: 'Booking ID',
      thanks: 'Thank you for choosing Rooh Al-Tarab — see you soon ✨',
      close: 'Close',
      uploaded: 'Receipt uploaded ✓',
      errs: {
        name: 'Name must be at least 2 characters',
        phone: 'Must start with 01 and be 11 digits',
        email: 'Invalid email address',
        receipt: 'Please upload your payment receipt',
        size: 'File exceeds 10MB limit',
        type: 'Unsupported file type',
      },
    },
  }[lang];

  const ticketName = isVip ? content.vipName : content.stdName;
  const ticketPrice = isVip ? content.vipPrice : content.stdPrice;

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const processFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error(content.errs.size); return; }
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) { toast.error(content.errs.type); return; }
    setReceipt(file);
    toast.success(content.uploaded);
  }, [content]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0]; if (f) processFile(f);
  }, [processFile]);

  const goNext2 = () => {
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(3);
  };

  const handleConfirm = () => {
    if (!receipt) { toast.error(content.errs.receipt); return; }
    setStep(4);
  };

  const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm py-3.5 px-4 rounded-xl hover:bg-white/5"
      style={{ fontFamily: AR(lang) }}
    >
      {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      {content.back}
    </button>
  );

  const inputCls = (err?: string) =>
    `w-full bg-[#111] border ${err ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-[#C6A04C]/50'} rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-[#161616] transition-all`;

  const ACCOUNTS = [
    { key: 'vodafone', label: content.vodafone, val: '01012345678', icon: '📱' },
    { key: 'instapay', label: content.instapay, val: 'roohaltarab@instapay', icon: '💳' },
  ];

  const slideVariants = {
    enter: { opacity: 0, x: lang === 'ar' ? -20 : 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: lang === 'ar' ? 20 : -20 },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-[#0D0D0D] border border-[#C6A04C]/20 rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-[0_0_80px_rgba(0,0,0,0.8)] outline-none"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#C6A04C22 transparent' }}
          role="dialog" aria-modal="true"
        >
          {/* Top accent */}
          <div className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] via-[#D4AF37] to-[#A8382A]' : 'from-[#A8382A] via-[#C6A04C] to-[#A8382A]'}`} />

          <div className="p-6 sm:p-8">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/30 hover:text-white/70 transition-colors z-10 rounded-full p-1 hover:bg-white/5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress */}
            {step < 4 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                {content.stepLabels.map((label, i) => {
                  const s = i + 1;
                  const done = step > s, active = step === s;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          done ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-white'
                               : active ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-[#080808] shadow-lg shadow-[#C6A04C]/30'
                               : 'bg-white/[0.06] text-white/25 border border-white/8'
                        }`}>
                          {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : s}
                        </div>
                        <span className={`text-[10px] ${active ? 'text-[#C6A04C]' : 'text-white/25'} transition-colors`} style={{ fontFamily: AR(lang) }}>
                          {label}
                        </span>
                      </div>
                      {s < 3 && (
                        <div className={`w-8 sm:w-12 h-px mt-[-18px] transition-all duration-500 ${done ? 'bg-gradient-to-r from-[#C6A04C] to-[#A8382A]' : 'bg-white/8'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ── Step 1: Ticket ── */}
              {step === 1 && (
                <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-center text-white mb-6" style={{ fontFamily: AR(lang) }}>
                    {content.ticketLabel}
                  </h2>
                  <div className={`rounded-xl border p-5 mb-6 ${isVip ? 'border-[#C6A04C]/25 bg-[#C6A04C]/5' : 'border-[#A8382A]/20 bg-[#A8382A]/5'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/35 mb-1" style={{ fontFamily: AR(lang) }}>{content.ticketLabel}</p>
                        <p className={`text-lg font-black ${isVip ? 'text-[#C6A04C]' : 'text-white'}`} style={{ fontFamily: AR(lang) }}>{ticketName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/35 mb-1" style={{ fontFamily: AR(lang) }}>{content.priceLabel}</p>
                        <p className="text-xl font-black text-white" style={{ fontFamily: AR(lang) }}>{ticketPrice}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-4 rounded-xl hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]"
                    style={{ fontFamily: AR(lang) }}
                  >
                    {content.next} {lang === 'ar' ? '←' : '→'}
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: Form ── */}
              {step === 2 && (
                <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-center text-white mb-6" style={{ fontFamily: AR(lang) }}>{content.stepLabels[1]}</h2>
                  <div className="space-y-4 mb-6">
                    {/* Name */}
                    <div>
                      <label className="block text-white/50 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.name}</label>
                      <input
                        type="text" value={formData.name} placeholder={content.namePh}
                        onChange={e => { setFormData(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: '' })); }}
                        className={inputCls(errors.name)} style={{ fontFamily: AR(lang), direction: 'auto' }}
                        autoComplete="name"
                      />
                      {errors.name && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }}><AlertCircle className="w-3 h-3 flex-shrink-0" />{content.errs.name}</p>}
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-white/50 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.phone}</label>
                      <input
                        type="tel" value={formData.phone} placeholder={content.phonePh} inputMode="numeric"
                        onChange={e => { setFormData(p => ({ ...p, phone: e.target.value })); setErrors(p => ({ ...p, phone: '' })); }}
                        className={inputCls(errors.phone)} style={{ direction: 'ltr' }}
                        autoComplete="tel"
                      />
                      {errors.phone && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }}><AlertCircle className="w-3 h-3 flex-shrink-0" />{content.errs.phone}</p>}
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-white/50 text-xs mb-1.5 flex items-center gap-1.5" style={{ fontFamily: AR(lang) }}>
                        {content.email}
                        <span className="text-white/20">({content.emailOpt})</span>
                      </label>
                      <input
                        type="email" value={formData.email} placeholder={content.emailPh} inputMode="email"
                        onChange={e => { setFormData(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })); }}
                        className={inputCls(errors.email)} style={{ direction: 'ltr' }}
                        autoComplete="email"
                      />
                      {errors.email && <p className="mt-1 text-red-400/80 text-xs flex items-center gap-1" style={{ fontFamily: AR(lang) }}><AlertCircle className="w-3 h-3 flex-shrink-0" />{content.errs.email}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <BackBtn onClick={() => setStep(1)} />
                    <button onClick={goNext2} className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]" style={{ fontFamily: AR(lang) }}>
                      {content.next} {lang === 'ar' ? '←' : '→'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Payment ── */}
              {step === 3 && (
                <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                  <h2 className="text-xl font-black text-center text-white mb-1" style={{ fontFamily: AR(lang) }}>{content.payTitle}</h2>
                  <p className="text-white/35 text-xs text-center mb-6 leading-relaxed" style={{ fontFamily: AR(lang) }}>{content.payDesc}</p>

                  {/* Amount reminder */}
                  <div className="bg-white/[0.03] border border-white/6 rounded-xl p-3 mb-5 flex items-center justify-between">
                    <span className="text-white/40 text-xs" style={{ fontFamily: AR(lang) }}>{ticketName}</span>
                    <span className="text-[#C6A04C] font-black text-base">{ticketPrice}</span>
                  </div>

                  {/* Payment accounts */}
                  <div className="space-y-3 mb-5">
                    {ACCOUNTS.map(({ key, label, val, icon }) => (
                      <div key={key} className="bg-[#111] border border-white/6 rounded-xl p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white/40 text-xs mb-0.5" style={{ fontFamily: AR(lang) }}>{icon} {label}</p>
                          <p className="text-[#C6A04C] font-mono font-bold text-sm sm:text-base tracking-wide select-all truncate">{val}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(val, key)}
                          className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all ${
                            copied === key
                              ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                              : 'bg-[#C6A04C]/8 text-[#C6A04C]/70 hover:text-[#C6A04C] hover:bg-[#C6A04C]/15 border border-[#C6A04C]/15'
                          }`}
                          aria-label={`Copy ${label}`}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copied === key ? content.copied : content.copy}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload */}
                  <label
                    className={`block rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 mb-5 ${
                      isDragging ? 'border-[#C6A04C] bg-[#C6A04C]/8 scale-[1.01]'
                      : receipt ? 'border-green-500/40 bg-green-500/5'
                      : 'border-white/10 hover:border-[#C6A04C]/30 hover:bg-[#C6A04C]/5'
                    }`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    {receipt ? (
                      <div className="text-green-400">
                        <Check className="w-7 h-7 mx-auto mb-2" strokeWidth={2.5} />
                        <p className="font-semibold text-sm truncate px-4" style={{ fontFamily: AR(lang) }}>{receipt.name}</p>
                        <p className="text-green-400/50 text-xs mt-1">{content.uploaded}</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-white/20 mx-auto mb-2" />
                        <p className="text-white/60 text-sm font-semibold mb-1" style={{ fontFamily: AR(lang) }}>{content.uploadLabel}</p>
                        <p className="text-white/25 text-xs mb-0.5">{content.dragText}</p>
                        <p className="text-white/15 text-xs">{content.fileHint}</p>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
                  </label>

                  <div className="flex gap-3">
                    <BackBtn onClick={() => setStep(2)} />
                    <button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]" style={{ fontFamily: AR(lang) }}>
                      {content.confirm}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Confirmed ── */}
              {step === 4 && (
                <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-4">
                  {/* Checkmark */}
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 250, damping: 20 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C6A04C] to-[#A8382A] flex items-center justify-center mx-auto mb-5 shadow-[0_0_40px_rgba(198,160,76,0.3)]"
                  >
                    <Check className="w-10 h-10 text-[#080808]" strokeWidth={3} />
                  </motion.div>

                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: AR(lang) }}>{content.confirmed}</h2>
                  <p className="text-white/40 text-sm mb-8 leading-relaxed" style={{ fontFamily: AR(lang) }}>{content.thanks}</p>

                  {/* Booking card */}
                  <div className="bg-gradient-to-br from-[#C6A04C]/8 to-[#A8382A]/8 border border-[#C6A04C]/25 rounded-xl p-5 mb-6">
                    <p className="text-white/35 text-xs mb-1.5" style={{ fontFamily: AR(lang) }}>{content.bookingNo}</p>
                    <p className="text-2xl font-black text-[#C6A04C] font-mono tracking-widest select-all mb-2">{bookingId}</p>
                    <div className="h-px bg-[#C6A04C]/15 mb-2" />
                    <p className="text-white/30 text-xs" style={{ fontFamily: AR(lang) }}>{ticketName} · {ticketPrice}</p>
                  </div>

                  {/* Notes decoration */}
                  <div className="flex justify-center gap-4 mb-6 text-[#C6A04C]/20 select-none" aria-hidden="true">
                    {['♩','♪','♫','♬','♪','♩'].map((n, i) => (
                      <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 1.5+i*0.2, repeat: Infinity, delay: i*0.15 }}>{n}</motion.span>
                    ))}
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-4 rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C]"
                    style={{ fontFamily: AR(lang) }}
                  >
                    {content.close}
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
