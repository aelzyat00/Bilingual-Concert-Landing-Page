import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Copy, Upload, X, AlertCircle, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AR } from './utils';

// Services
import { getAvailableSeats, getBookedSeats, createBooking } from '../services/booking-service';
import { downloadMultipleTickets, TicketInfo } from '../services/ticket-generator';

// Components
import { Seat, allSeats, seatLayout } from './seat-layout';
import SeatPicker from './seat-picker';

interface BookingFlowProps {
  lang: 'ar' | 'en';
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  quantity: number;
}

function genBookingId() {
  return `RT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function validate(formData: FormData) {
  const errors: Record<string, string> = {};
  if (formData.name.trim().length < 2) errors.name = 'name';
  if (!/^(01)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) errors.phone = 'phone';
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'email';
  if (!Number.isInteger(formData.quantity) || formData.quantity < 1 || formData.quantity > 10) errors.quantity = 'quantity';
  return errors;
}

export function BookingFlowV2({ lang, onClose }: BookingFlowProps) {
  const [step, setStep] = useState(1); // 1: Type, 2: Quantity, 3: Seats, 4: User Info, 5: Payment, 6: Confirmation
  const [ticketType, setTicketType] = useState<'vip' | 'classic' | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', email: '', quantity: 1 });
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'vodafone' | 'instapay' | 'card'>('vodafone');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bookingId] = useState(genBookingId);
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<Set<string>>(new Set());
  const [maxQuantity, setMaxQuantity] = useState(10);

  const fileRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch booked seats on component mount and when ticket type changes
  useEffect(() => {
    if (ticketType) {
      loadBookedSeats(ticketType);
    }
  }, [ticketType]);

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  async function loadBookedSeats(type: 'vip' | 'classic') {
    try {
      setIsLoading(true);
      const booked = await getBookedSeats(type);
      const bookedSet = new Set(booked.map(s => `${s.row}-${s.seat_number}`));
      setBookedSeats(bookedSet);

      // Calculate max available seats
      const available = seatLayout[type];
      const totalSeats = Object.values(available).reduce((a, b) => a + b, 0);
      const maxAvailable = totalSeats - bookedSet.size;
      setMaxQuantity(Math.min(maxAvailable, 10));
    } catch (error) {
      console.error('[v0] Error loading booked seats:', error);
      toast.error(lang === 'ar' ? 'خطأ في تحميل المقاعد' : 'Error loading seats');
    } finally {
      setIsLoading(false);
    }
  }

  const ticketPrice = ticketType === 'vip' ? '500' : '350';
  const ticketName = ticketType === 'vip' ? (lang === 'ar' ? 'تذكرة VIP' : 'VIP Signature') : (lang === 'ar' ? 'تذكرة عادية' : 'Classic Ticket');

  const content = {
    ar: {
      stepLabels: ['النوع', 'الكمية', 'المقاعد', 'بياناتك', 'الدفع', 'تأكيد'],
      selectType: 'اختر نوع التذكرة',
      vip: 'VIP Signature',
      classic: 'تذكرة عادية',
      quantity: 'عدد التذاكر',
      selectSeats: 'اختر المقاعد',
      seatsAvailable: 'المقاعد المتاحة',
      yourInfo: 'بياناتك الشخصية',
      name: 'الاسم الكامل',
      phone: 'رقم الهاتف',
      email: 'البريد الإلكتروني (اختياري)',
      payment: 'طريقة الدفع',
      vodafone: 'فودافون كاش',
      instapay: 'إنستاباي',
      card: 'كارت بنكي',
      confirm: 'تأكيد الحجز',
      bookingId: 'رقم الحجز',
      totalPrice: 'السعر الإجمالي',
      downloadTickets: 'تحميل التذاكر',
      whatsapp: 'أرسل عبر واتساب',
      next: 'التالي',
      back: 'رجوع',
      errs: {
        name: 'الاسم يجب أن يحتوي على حرفين على الأقل',
        phone: 'رقم يبدأ بـ 01 ومكون من 11 رقم',
        email: 'بريد إلكتروني غير صحيح',
        quantity: 'أدخل عدداً صحيحاً من 1 إلى 10',
        seats: 'اختر المقاعد المطابقة لعدد التذاكر',
      },
    },
    en: {
      stepLabels: ['Type', 'Quantity', 'Seats', 'Info', 'Payment', 'Confirm'],
      selectType: 'Select Ticket Type',
      vip: 'VIP Signature',
      classic: 'Classic Ticket',
      quantity: 'Quantity',
      selectSeats: 'Select Seats',
      seatsAvailable: 'Available Seats',
      yourInfo: 'Your Information',
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email (Optional)',
      payment: 'Payment Method',
      vodafone: 'Vodafone Cash',
      instapay: 'InstaPay',
      card: 'Bank Card',
      confirm: 'Confirm Booking',
      bookingId: 'Booking ID',
      totalPrice: 'Total Price',
      downloadTickets: 'Download Tickets',
      whatsapp: 'Send via WhatsApp',
      next: 'Next',
      back: 'Back',
      errs: {
        name: 'Name must be at least 2 characters',
        phone: 'Phone must start with 01 and be 11 digits',
        email: 'Invalid email format',
        quantity: 'Enter a number between 1 and 10',
        seats: 'Select seats matching the quantity',
      },
    },
  };

  const currentContent = content[lang];

  const inputCls = (err?: string) =>
    `w-full bg-[#111] border ${err ? 'border-red-500/50 focus:border-red-500' : 'border-white/8 focus:border-[#C6A04C]/50'} rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:bg-[#161616] transition-all`;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseInt(e.target.value) || 0, maxQuantity);
    setFormData({ ...formData, quantity: value });
    setSelectedSeats([]); // Reset seat selection
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const ticketInfos: TicketInfo[] = selectedSeats.map(seat => ({
        bookingId,
        guestName: formData.name,
        ticketType: ticketType || 'classic',
        row: seat.row,
        seatNumber: seat.seat_number,
        eventName: 'Cinema Event 2026',
        eventDate: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
        ticketPrice: ticketPrice,
      }));

      // Create booking in database
      await createBooking({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        theater_type: ticketType || 'classic',
        seats: selectedSeats.map(s => ({ row: s.row, seat_number: s.seat_number })),
        payment_method: paymentMethod,
        receipt_url: '',
      });

      // Download tickets
      await downloadMultipleTickets(ticketInfos);
      toast.success(lang === 'ar' ? 'تم تحميل التذاكر بنجاح' : 'Tickets downloaded successfully');
      setStep(6);
    } catch (error) {
      console.error('[v0] Payment error:', error);
      toast.error(lang === 'ar' ? 'حدث خطأ أثناء الدفع' : 'Payment error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl hover:bg-white/5"
      style={{ fontFamily: AR(lang) }}
    >
      {lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      {currentContent.back}
    </motion.button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2"
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="relative bg-[#0D0D0D] border border-[#C6A04C]/20 rounded-2xl max-w-[420px] w-[95vw] sm:w-full max-h-[90vh] sm:max-h-[92vh] overflow-y-auto overflow-x-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] outline-none"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#C6A04C22 transparent' }}
          role="dialog"
          aria-modal="true"
        >
          {/* Progress */}
          {step < 6 && (
            <div className="absolute inset-x-0 -top-5 sm:-top-6 z-40 pointer-events-none px-2">
              <div className="flex items-center justify-center gap-1 sm:gap-2 bg-transparent pointer-events-auto overflow-x-auto pb-1">
                {currentContent.stepLabels.map((label, i) => {
                  const s = i + 1;
                  const done = step > s,
                    active = step === s;
                  return (
                    <div key={s} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                        done
                          ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-white'
                          : active
                          ? 'bg-gradient-to-br from-[#C6A04C] to-[#A8382A] text-[#080808] shadow-lg shadow-[#C6A04C]/30'
                          : 'bg-white/[0.06] text-white/25 border border-white/8'
                      }`}>
                        {done ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={3} /> : s}
                      </div>
                      {s < currentContent.stepLabels.length && (
                        <div className={`flex-1 h-px w-1 sm:w-2 mx-0.5 sm:mx-1 transition-all duration-500 ${done ? 'bg-gradient-to-r from-[#C6A04C] to-[#A8382A]' : 'bg-white/8'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="pt-10 p-4 sm:pt-12 sm:p-6 md:pt-14 md:p-8">
            <button onClick={onClose} className="absolute right-4 top-4 sm:right-6 sm:top-6 text-white/40 hover:text-white/70 transition-colors p-1.5 hover:bg-white/5 rounded-lg">
              <X className="w-5 h-5" />
            </button>

            {/* Step 1: Select Type */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: AR(lang) }}>
                    {currentContent.selectType}
                  </h2>
                  <p className="text-white/50 text-sm" style={{ fontFamily: AR(lang) }}>
                    {lang === 'ar' ? 'اختر النوع المناسب لك' : 'Choose the ticket type that suits you'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {/* VIP Option */}
                    <motion.button
                      onClick={() => {
                        setTicketType('vip');
                        setFormData({ ...formData, quantity: 1 });
                        setSelectedSeats([]);
                        setStep(2);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 border-2 border-[#C6A04C]/20 rounded-xl hover:border-[#C6A04C] bg-[#C6A04C]/5 hover:bg-[#C6A04C]/10 transition-all group"
                    >
                      <div className="text-[#C6A04C] font-black text-sm mb-1">{currentContent.vip}</div>
                      <div className="text-white/70 text-xs group-hover:text-white/90">500 {lang === 'ar' ? 'جنيه' : 'EGP'}</div>
                      <div className="text-white/50 text-[10px] mt-2">{lang === 'ar' ? '7 + 8 + 8 = 23' : '7 + 8 + 8 = 23'}</div>
                    </motion.button>

                    {/* Classic Option */}
                    <motion.button
                      onClick={() => {
                        setTicketType('classic');
                        setFormData({ ...formData, quantity: 1 });
                        setSelectedSeats([]);
                        setStep(2);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 border-2 border-[#A8382A]/20 rounded-xl hover:border-[#A8382A] bg-[#A8382A]/5 hover:bg-[#A8382A]/10 transition-all group"
                    >
                      <div className="text-[#A8382A] font-black text-sm mb-1">{currentContent.classic}</div>
                      <div className="text-white/70 text-xs group-hover:text-white/90">350 {lang === 'ar' ? 'جنيه' : 'EGP'}</div>
                      <div className="text-white/50 text-[10px] mt-2">{lang === 'ar' ? '254 مقعد' : '254 seats'}</div>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Select Quantity */}
              {step === 2 && ticketType && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: AR(lang) }}>
                    {currentContent.quantity}
                  </h2>
                  <p className="text-white/50 text-sm" style={{ fontFamily: AR(lang) }}>
                    {lang === 'ar' ? `تذاكر ${ticketName}` : `${ticketName} tickets`}
                  </p>

                  <div className="mt-6 space-y-3">
                    <input
                      type="number"
                      min="1"
                      max={maxQuantity}
                      value={formData.quantity}
                      onChange={handleQuantityChange}
                      className={inputCls()}
                      placeholder={lang === 'ar' ? 'أدخل العدد' : 'Enter quantity'}
                      style={{ fontFamily: AR(lang) }}
                    />
                    <p className="text-xs text-white/40" style={{ fontFamily: AR(lang) }}>
                      {lang === 'ar' ? `أقصى كمية: ${maxQuantity}` : `Maximum: ${maxQuantity}`}
                    </p>
                  </div>

                  <div className="flex gap-2 sm:gap-3 mt-6">
                    <BackBtn onClick={() => setStep(1)} />
                    <motion.button
                      onClick={() => setStep(3)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-2.5 sm:py-3.5 rounded-xl transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] hover:opacity-90"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {currentContent.next} {lang === 'ar' ? '←' : '→'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Select Seats */}
              {step === 3 && ticketType && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: AR(lang) }}>
                    {currentContent.selectSeats}
                  </h2>
                  <p className="text-white/50 text-sm" style={{ fontFamily: AR(lang) }}>
                    {lang === 'ar' ? `اختر ${formData.quantity} مقاعد من فضلك` : `Select ${formData.quantity} seats`}
                  </p>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#C6A04C] animate-spin" />
                    </div>
                  ) : (
                    <div className="mt-6">
                      <SeatPicker type={ticketType} available={bookedSeats} quantity={formData.quantity} onChange={setSelectedSeats} lang={lang} />
                    </div>
                  )}

                  <div className="flex gap-2 sm:gap-3 mt-6">
                    <BackBtn onClick={() => setStep(2)} />
                    <motion.button
                      onClick={() => {
                        if (selectedSeats.length !== formData.quantity) {
                          setErrors({ seats: 'required' });
                          return;
                        }
                        setStep(4);
                      }}
                      disabled={selectedSeats.length !== formData.quantity}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-2.5 sm:py-3.5 rounded-xl transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {currentContent.next} {lang === 'ar' ? '←' : '→'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: User Info */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: AR(lang) }}>
                    {currentContent.yourInfo}
                  </h2>

                  <div className="space-y-3 sm:space-y-4 mt-6">
                    <div>
                      <label className="block text-white/50 text-xs mb-1 sm:mb-1.5" style={{ fontFamily: AR(lang) }}>
                        {currentContent.name}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className={inputCls(errors.name)}
                        placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                        style={{ fontFamily: AR(lang) }}
                      />
                      {errors.name && <p className="text-red-400/80 text-xs mt-1" style={{ fontFamily: AR(lang) }}>{currentContent.errs.name}</p>}
                    </div>

                    <div>
                      <label className="block text-white/50 text-xs mb-1 sm:mb-1.5" style={{ fontFamily: AR(lang) }}>
                        {currentContent.phone}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className={inputCls(errors.phone)}
                        placeholder="01XXXXXXXXX"
                        style={{ fontFamily: AR(lang) }}
                      />
                      {errors.phone && <p className="text-red-400/80 text-xs mt-1" style={{ fontFamily: AR(lang) }}>{currentContent.errs.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-white/50 text-xs mb-1 sm:mb-1.5 flex items-center gap-1" style={{ fontFamily: AR(lang) }}>
                        {currentContent.email}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className={inputCls(errors.email)}
                        placeholder="example@email.com"
                        style={{ fontFamily: AR(lang) }}
                      />
                      {errors.email && <p className="text-red-400/80 text-xs mt-1" style={{ fontFamily: AR(lang) }}>{currentContent.errs.email}</p>}
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 mt-6">
                    <BackBtn onClick={() => setStep(3)} />
                    <motion.button
                      onClick={() => {
                        const newErrors = validate(formData);
                        if (Object.keys(newErrors).length === 0) {
                          setErrors({});
                          setStep(5);
                        } else {
                          setErrors(newErrors);
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-2.5 sm:py-3.5 rounded-xl transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] hover:opacity-90"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {currentContent.next} {lang === 'ar' ? '←' : '→'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Payment */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: AR(lang) }}>
                    {currentContent.payment}
                  </h2>

                  <div className="space-y-2 mt-6">
                    {['vodafone', 'instapay', 'card'].map((method, idx) => (
                      <motion.button
                        key={method}
                        onClick={() => setPaymentMethod(method as any)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-3 sm:p-4 border-2 rounded-xl transition-all ${
                          paymentMethod === method ? 'border-[#C6A04C] bg-[#C6A04C]/10' : 'border-white/10 hover:border-white/20'
                        }`}
                        style={{ fontFamily: AR(lang) }}
                      >
                        <div className={`text-sm font-bold ${paymentMethod === method ? 'text-[#C6A04C]' : 'text-white/70'}`}>
                          {currentContent[method as any]}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{lang === 'ar' ? 'عدد التذاكر:' : 'Tickets:'}</span>
                      <span className="text-white">{formData.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{lang === 'ar' ? 'السعر الواحد:' : 'Price:'}</span>
                      <span className="text-white">{ticketPrice} {lang === 'ar' ? 'جنيه' : 'EGP'}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-black">
                      <span className="text-white">{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                      <span className="text-[#C6A04C]">{parseInt(ticketPrice) * formData.quantity} {lang === 'ar' ? 'جنيه' : 'EGP'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3 mt-6">
                    <BackBtn onClick={() => setStep(4)} />
                    <motion.button
                      onClick={handlePayment}
                      disabled={isLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-2.5 sm:py-3.5 rounded-xl transition-opacity text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ fontFamily: AR(lang) }}
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {lang === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Confirmation */}
              {step === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#C6A04C] to-[#A8382A] rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-[#080808]" strokeWidth={3} />
                    </div>
                  </motion.div>

                  <h2 className="text-2xl font-black text-white" style={{ fontFamily: AR(lang) }}>
                    {lang === 'ar' ? 'تم الحجز بنجاح!' : 'Booking Confirmed!'}
                  </h2>

                  <p className="text-white/70 text-sm" style={{ fontFamily: AR(lang) }}>
                    {lang === 'ar' ? 'تم تحميل التذاكر بنجاح. شكراً لحجزك!' : 'Your tickets have been downloaded. Thank you for booking!'}
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">{currentContent.bookingId}</span>
                      <div className="flex items-center gap-2">
                        <code className="text-[#C6A04C] font-mono text-sm">{bookingId}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bookingId);
                            setCopied(bookingId);
                            setTimeout(() => setCopied(null), 2000);
                          }}
                          className="text-white/40 hover:text-white/70 transition-colors p-1 hover:bg-white/5 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] font-black py-3 rounded-xl transition-opacity hover:opacity-90 mt-6"
                    style={{ fontFamily: AR(lang) }}
                  >
                    {lang === 'ar' ? 'إغلاق' : 'Close'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
