import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Sparkles, Music2, Star } from 'lucide-react';

interface TicketsSectionProps {
  lang: 'ar' | 'en';
  onSelectTicket: (type: 'vip' | 'standard') => void;
}

const AR = (lang: 'ar' | 'en') => lang === 'ar' ? 'Cairo, sans-serif' : "'Cormorant Garamond', serif";

function CounterBadge({ label, value, lang }: { label: string; value: string; lang: 'ar' | 'en' }) {
  return (
    <div className="flex flex-col items-center px-4 py-2">
      <span className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: AR(lang) }}>{value}</span>
      <span className="text-white/35 text-xs uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

function TicketCard({
  lang, isVip, onSelect,
  title, titleSub, price, currency, features, buttonLabel, badge
}: {
  lang: 'ar' | 'en'; isVip: boolean; onSelect: () => void;
  title: string; titleSub: string; price: string; currency: string;
  features: string[]; buttonLabel: string; badge?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const goldBorder = 'border-[#C6A04C]/30 hover:border-[#C6A04C]/60';
  const redBorder = 'border-[#A8382A]/30 hover:border-[#A8382A]/60';

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: isVip ? 0.2 : 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className={`relative group cursor-pointer`}
    >
      {/* Ambient glow behind card */}
      <div
        className={`absolute -inset-2 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
          isVip ? 'bg-gradient-to-br from-[#C6A04C]/20 to-[#A8382A]/20' : 'bg-gradient-to-br from-[#A8382A]/15 to-[#C6A04C]/15'
        }`}
        aria-hidden="true"
      />

      <div
        className={`relative h-full bg-[#0D0D0D] rounded-2xl border ${isVip ? goldBorder : redBorder} transition-all duration-500 overflow-hidden`}
      >
        {/* Top accent line */}
        <div
          className={`h-[2px] w-full bg-gradient-to-r ${isVip ? 'from-[#C6A04C] via-[#D4AF37] to-[#A8382A]' : 'from-[#A8382A] via-[#C6A04C] to-[#A8382A]'}`}
          aria-hidden="true"
        />

        {/* Inner glow at top */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 blur-3xl opacity-20 ${isVip ? 'bg-[#C6A04C]' : 'bg-[#A8382A]'}`}
          aria-hidden="true"
        />

        <div className="p-7 sm:p-8 relative">
          {/* Badge */}
          {badge && (
            <div className="flex justify-center mb-5">
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-semibold tracking-wider uppercase ${
                  isVip
                    ? 'bg-[#C6A04C]/10 border-[#C6A04C]/30 text-[#C6A04C]'
                    : 'bg-[#A8382A]/10 border-[#A8382A]/30 text-[#A8382A]/80'
                }`}
                style={{ fontFamily: AR(lang) }}
              >
                {isVip ? <Sparkles className="w-3 h-3" /> : <Music2 className="w-3 h-3" />}
                {badge}
              </span>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-6">
            <h3
              className={`text-2xl sm:text-3xl font-black mb-1 ${isVip ? 'text-[#C6A04C]' : 'text-white'}`}
              style={{ fontFamily: AR(lang) }}
            >
              {title}
            </h3>
            <p className="text-white/35 text-sm" style={{ fontFamily: lang === 'ar' ? "'Cormorant Garamond', serif" : 'Cairo, sans-serif' }}>
              {titleSub}
            </p>
          </div>

          {/* Divider */}
          <div className={`h-px mb-6 bg-gradient-to-r from-transparent ${isVip ? 'via-[#C6A04C]/30' : 'via-[#A8382A]/30'} to-transparent`} aria-hidden="true" />

          {/* Price */}
          <div className="text-center mb-7">
            <div className="flex items-end justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-black text-white tabular-nums leading-none">{price}</span>
              <span className={`text-lg font-bold mb-1 ${isVip ? 'text-[#C6A04C]' : 'text-[#A8382A]/80'}`}>{currency}</span>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5 text-white/60 text-sm" style={{ fontFamily: AR(lang) }}>
                <Star
                  className={`w-3 h-3 flex-shrink-0 ${isVip ? 'text-[#C6A04C]' : 'text-[#A8382A]/70'}`}
                  fill="currentColor"
                />
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <motion.button
            onClick={onSelect}
            whileTap={{ scale: 0.97 }}
            className={`w-full py-3.5 rounded-xl font-black text-sm transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A04C] ${
              isVip
                ? 'bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] hover:shadow-lg hover:shadow-[#C6A04C]/25'
                : 'bg-transparent border-2 border-[#A8382A]/50 text-white hover:bg-[#A8382A]/10 hover:border-[#A8382A]'
            }`}
            style={{ fontFamily: AR(lang) }}
          >
            {buttonLabel}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export function TicketsSection({ lang, onSelectTicket }: TicketsSectionProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const t = {
    ar: {
      heading: 'التذاكر',
      subheading: 'اختر تجربتك الموسيقية',
      classicTitle: 'Classic', classicSub: 'كلاسيك',
      classicBadge: 'حضور راقٍ',
      classicPrice: '350', classicCur: 'جنيه',
      classicFeatures: ['دخول حفل روح الطرب', 'مقعد كلاسيك مميز', 'أجواء احترافية', 'تجربة موسيقية أصيلة'],
      vipTitle: 'VIP Signature', vipSub: 'في آي بي سيجنتشر',
      vipBadge: 'تجربة حصرية',
      vipPrice: '500', vipCur: 'جنيه',
      vipFeatures: ['دخول VIP حصري', 'مقعد مميز في المقدمة', 'استقبال خاص', 'أجواء فاخرة وخصوصية', 'هدية تذكارية'],
      cta: 'احجز الآن',
      stat1L: 'مارس', stat1V: '٢٠',
      stat2L: 'العيد', stat2V: 'اليوم ٥',
      stat3L: 'ليلة', stat3V: '١',
    },
    en: {
      heading: 'Tickets',
      subheading: 'Choose Your Musical Experience',
      classicTitle: 'Classic', classicSub: 'كلاسيك',
      classicBadge: 'Elegant Attendance',
      classicPrice: '350', classicCur: 'EGP',
      classicFeatures: ['Concert admission', 'Classic premium seating', 'Professional atmosphere', 'Authentic musical experience'],
      vipTitle: 'VIP Signature', vipSub: 'في آي بي سيجنتشر',
      vipBadge: 'Exclusive Experience',
      vipPrice: '500', vipCur: 'EGP',
      vipFeatures: ['Exclusive VIP entry', 'Front premium seating', 'Personal reception', 'Luxury private atmosphere', 'Commemorative gift'],
      cta: 'Book Now',
      stat1L: 'March', stat1V: '20',
      stat2L: 'Eid Day', stat2V: '5th',
      stat3L: 'Night', stat3V: '1',
    },
  }[lang];

  return (
    <section
      id="tickets"
      ref={ref}
      className="relative py-28 px-4 overflow-hidden"
      aria-labelledby="tickets-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-[#0A0A0A] to-[#080808]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(rgba(198,160,76,1) 1px, transparent 1px), linear-gradient(90deg, rgba(198,160,76,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      {/* Corner ornaments */}
      <div className="absolute top-12 left-8 w-20 h-20 border-t border-l border-[#C6A04C]/10" aria-hidden="true" />
      <div className="absolute top-12 right-8 w-20 h-20 border-t border-r border-[#C6A04C]/10" aria-hidden="true" />
      <div className="absolute bottom-12 left-8 w-20 h-20 border-b border-l border-[#C6A04C]/10" aria-hidden="true" />
      <div className="absolute bottom-12 right-8 w-20 h-20 border-b border-r border-[#C6A04C]/10" aria-hidden="true" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p
            className="text-[#C6A04C] text-xs tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: AR(lang) }}
          >
            ♩ {t.heading} ♩
          </p>
          <h2
            id="tickets-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4"
            style={{ fontFamily: AR(lang) }}
          >
            {t.subheading}
          </h2>
          <div className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-[#C6A04C]/40 to-transparent" />
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center justify-center gap-0 mb-14"
        >
          <div className="flex items-stretch bg-white/[0.03] border border-[#C6A04C]/12 rounded-2xl overflow-hidden divide-x divide-[#C6A04C]/10" dir="ltr">
            <CounterBadge label={t.stat1L} value={t.stat1V} lang={lang} />
            <div className="w-px bg-[#C6A04C]/10" />
            <CounterBadge label={t.stat2L} value={t.stat2V} lang={lang} />
            <div className="w-px bg-[#C6A04C]/10" />
            <CounterBadge label={t.stat3L} value={t.stat3V} lang={lang} />
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <TicketCard
            lang={lang} isVip={false}
            onSelect={() => onSelectTicket('standard')}
            title={t.classicTitle} titleSub={t.classicSub}
            badge={t.classicBadge}
            price={t.classicPrice} currency={t.classicCur}
            features={t.classicFeatures}
            buttonLabel={t.cta}
          />
          <TicketCard
            lang={lang} isVip={true}
            onSelect={() => onSelectTicket('vip')}
            title={t.vipTitle} titleSub={t.vipSub}
            badge={t.vipBadge}
            price={t.vipPrice} currency={t.vipCur}
            features={t.vipFeatures}
            buttonLabel={t.cta}
          />
        </div>
      </div>
    </section>
  );
}
