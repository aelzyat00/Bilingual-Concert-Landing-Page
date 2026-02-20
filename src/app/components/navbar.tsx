import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Globe, Menu, X } from 'lucide-react';
import logoImage from '@/assets/logo.png';

interface NavBarProps {
  lang: 'ar' | 'en';
  onLanguageToggle: () => void;
  onBookNow: () => void;
}

const AR = (lang: 'ar' | 'en') => lang === 'ar' ? 'Cairo, sans-serif' : "'Cormorant Garamond', serif";

export function NavBar({ lang, onLanguageToggle, onBookNow }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['rgba(8,8,8,0)', 'rgba(8,8,8,0.95)']);
  const borderOp = useTransform(scrollY, [0, 80], [0, 0.15]);

  // close menu on scroll
  useEffect(() => {
    const unsub = scrollY.on('change', v => { if (v > 50) setMenuOpen(false); });
    return unsub;
  }, [scrollY]);

  const t = {
    ar: { tickets: 'التذاكر', book: 'احجز الآن', switchLang: 'EN' },
    en: { tickets: 'Tickets', book: 'Book Now', switchLang: 'ع' },
  }[lang];

  return (
    <>
      <motion.nav
        style={{ background: bg }}
        className="fixed top-0 inset-x-0 z-40 backdrop-blur-md"
      >
        <motion.div
          style={{ borderBottomColor: borderOp.get() > 0 ? `rgba(198,160,76,${borderOp.get()})` : 'transparent' }}
          className="border-b transition-colors"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C6A04C]/30 flex-shrink-0">
                <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span
                className="text-white/80 text-sm font-semibold hidden sm:block tracking-wide"
                style={{ fontFamily: AR(lang) }}
              >
                {lang === 'ar' ? 'روح الطرب' : 'Rooh Al-Tarab'}
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={onBookNow}
                className="text-white/60 hover:text-white text-sm transition-colors"
                style={{ fontFamily: AR(lang) }}
              >
                {t.tickets}
              </button>
              <button
                onClick={onLanguageToggle}
                className="flex items-center gap-1.5 text-[#C6A04C]/70 hover:text-[#C6A04C] text-sm transition-colors"
                style={{ fontFamily: AR(lang) }}
              >
                <Globe className="w-3.5 h-3.5" />
                {t.switchLang}
              </button>
              <button
                onClick={onBookNow}
                className="bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] px-5 py-2 rounded-full text-sm font-black hover:opacity-90 transition-opacity"
                style={{ fontFamily: AR(lang) }}
              >
                {t.book}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/60 hover:text-white transition-colors"
              onClick={() => setMenuOpen(p => !p)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      </motion.nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-16 inset-x-0 z-30 bg-[#0D0D0D]/98 backdrop-blur-xl border-b border-[#C6A04C]/10 py-6 px-6 flex flex-col gap-4 md:hidden"
        >
          <button onClick={() => { onBookNow(); setMenuOpen(false); }} className="text-white/70 text-base" style={{ fontFamily: AR(lang) }}>{t.tickets}</button>
          <button onClick={onLanguageToggle} className="text-[#C6A04C]/70 text-base flex items-center gap-2" style={{ fontFamily: AR(lang) }}>
            <Globe className="w-4 h-4" />{t.switchLang}
          </button>
          <button onClick={() => { onBookNow(); setMenuOpen(false); }} className="bg-gradient-to-r from-[#C6A04C] to-[#A8382A] text-[#080808] px-6 py-3 rounded-full font-black text-sm w-full" style={{ fontFamily: AR(lang) }}>
            {t.book}
          </button>
        </motion.div>
      )}
    </>
  );
}
