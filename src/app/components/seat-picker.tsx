import React, { useState } from 'react';
import { Seat, allSeats, seatLayout } from './seat-layout';
import { motion } from 'motion/react';

interface SeatPickerProps {
  type: 'vip' | 'classic';
  available: Set<string>;
  quantity: number;
  onChange: (seats: Seat[]) => void;
  lang: 'ar' | 'en';
}

export default function SeatPicker({ type, available, quantity, onChange, lang }: SeatPickerProps) {
  const [selected, setSelected] = useState<Seat[]>([]);
  const isVip = type === 'vip';
  const accentColor = isVip ? '#C6A04C' : '#A8382A';

  function toggle(seat: Seat) {
    const key = `${seat.row}-${seat.seat_number}`;
    if (available.has(key)) return;
    const idx = selected.findIndex(s => s.row === seat.row && s.seat_number === seat.seat_number);
    let next = [...selected];
    if (idx >= 0) {
      next.splice(idx, 1);
    } else if (next.length < quantity) {
      next.push(seat);
    }
    setSelected(next);
    onChange(next);
  }

  const screenLabel = lang === 'ar' ? 'الشاشة' : 'Screen';

  return (
    <div className="space-y-4 w-full">
      {/* Screen */}
      <div className="relative flex flex-col items-center">
        <div className="relative w-full max-w-2xl mx-auto px-2">
          <div className="h-1 bg-gradient-to-r from-transparent via-[#C6A04C]/50 to-transparent rounded-full" />
          <p className="text-center text-xs text-white/40 mt-2" style={{ fontFamily: 'Arial, sans-serif' }}>
            {screenLabel}
          </p>
        </div>
      </div>

      {/* Seats Grid - Mobile Optimized */}
      <div className="w-full overflow-x-auto pb-2 px-2 sm:px-0">
        <div className="space-y-1 sm:space-y-2 inline-block min-w-full">
          {Object.entries(seatLayout[type]).map(([row, count]) => (
            <div key={row} className="flex items-center gap-1 sm:gap-2 justify-center">
              <span className="w-5 sm:w-6 text-center font-semibold text-white/60 text-[10px] sm:text-xs flex-shrink-0">{row}</span>
              <div className="flex gap-0.5 sm:gap-1 flex-wrap justify-center">
                {Array.from({ length: count as number }, (_, i) => {
                  const seat = { row, seat_number: i + 1 };
                  const key = `${row}-${seat.seat_number}`;
                  const busy = available.has(key);
                  const sel = selected.some(s => s.row === row && s.seat_number === seat.seat_number);
                  return (
                    <motion.button
                      key={key}
                      disabled={busy}
                      onClick={() => toggle(seat)}
                      whileHover={!busy ? { scale: 1.1 } : {}}
                      whileTap={!busy && sel ? { scale: 0.95 } : {}}
                      className={`w-6 h-6 sm:w-7 sm:h-7 text-[9px] sm:text-[10px] flex items-center justify-center rounded transition-all duration-200 font-bold ${
                        busy
                          ? 'bg-red-500/40 text-red-300/50 cursor-not-allowed'
                          : sel
                          ? 'text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/15'
                      }`}
                      style={{
                        backgroundColor: sel ? accentColor : undefined,
                        boxShadow: sel ? `0 0 12px ${accentColor}40` : 'none',
                      }}
                      aria-label={`Row ${row} seat ${seat.number}${busy ? ' occupied' : sel ? ' selected' : ''}`}
                      aria-pressed={sel}
                    >
                      {seat.number}
                    </motion.button>
                  );
                })}
              </div>
              <span className="w-5 sm:w-6 text-center font-semibold text-white/60 text-[10px] sm:text-xs flex-shrink-0">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 sm:gap-4 justify-center text-[10px] sm:text-xs pt-3 sm:pt-4 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white/10 rounded-sm" />
          <span className="text-white/60">{lang === 'ar' ? 'متاح' : 'Available'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm" style={{ backgroundColor: accentColor }} />
          <span className="text-white/60">{lang === 'ar' ? 'محدد' : 'Selected'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500/40 rounded-sm" />
          <span className="text-white/60">{lang === 'ar' ? 'محجوز' : 'Booked'}</span>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3 text-center">
        <p className="text-xs sm:text-sm text-white/70">
          {lang === 'ar' ? `تم اختيار ${selected.length} من ${quantity}` : `Selected ${selected.length} of ${quantity}`}
        </p>
        {selected.length > 0 && (
          <p className="text-[10px] sm:text-xs text-white/50 mt-1 break-words">
            {selected.map(s => `${s.row}${s.seat_number}`).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
