# API Reference - نظام حجز التذاكر

## الخدمات المتاحة

### 1. Booking Service (`src/app/services/booking-service.ts`)

#### `getAvailableSeats(theaterType: 'vip' | 'classic'): Promise<Seat[]>`
```typescript
// الحصول على جميع المقاعد المتاحة
const vipSeats = await getAvailableSeats('vip');
// النتيجة: Array<{ id, theater_type, row, seat_number, is_available, created_at }>
```

#### `getBookedSeats(theaterType: 'vip' | 'classic'): Promise<Set<string>>`
```typescript
// الحصول على المقاعد المحجوزة كـ Set
const booked = await getBookedSeats('classic');
// النتيجة: Set<"A-1", "A-2", "B-5", ...>
```

#### `getSeatLayout(theaterType: 'vip' | 'classic'): Promise<Record<string, number>>`
```typescript
// الحصول على عدد المقاعد في كل صف
const layout = await getSeatLayout('vip');
// النتيجة: { A: 7, B: 8, C: 8 }
```

#### `createBooking(data: BookingData): Promise<string>`
```typescript
// إنشاء حجز جديد
const bookingId = await createBooking({
  name: 'أحمد محمد',
  phone: '201012345678',
  email: 'user@example.com',
  theater_type: 'vip',
  seats: [
    { row: 'A', seat_number: 1 },
    { row: 'A', seat_number: 2 }
  ],
  payment_method: 'vodafone',
  receipt_url: 'https://...',
  status: 'completed'
});
// النتيجة: UUID
```

#### `updateSeatStatus(seatId: string, isAvailable: boolean): Promise<void>`
```typescript
// تحديث حالة المقعد
await updateSeatStatus('seat-uuid', false); // احجز المقعد
await updateSeatStatus('seat-uuid', true);  // افتح المقعد
```

---

### 2. Ticket Generator (`src/app/services/ticket-generator.ts`)

#### `generateIndividualTicket(ticketInfo: TicketInfo): Promise<Blob>`
```typescript
// توليد تذكرة واحدة
const ticketBlob = await generateIndividualTicket({
  bookingId: 'RT-ABC123',
  guestName: 'أحمد محمد',
  ticketType: 'vip',
  row: 'A',
  seatNumber: 1,
  eventName: 'Cinema Event 2026',
  eventDate: '2026-03-15',
  ticketPrice: '250 EGP'
});
// النتيجة: Blob (صورة PNG عالية الجودة)
```

#### `downloadMultipleTickets(ticketsInfo: TicketInfo[]): Promise<void>`
```typescript
// تحميل عدة تذاكر دفعة واحدة
await downloadMultipleTickets([
  {
    bookingId: 'RT-ABC123',
    guestName: 'أحمد',
    ticketType: 'vip',
    row: 'A',
    seatNumber: 1,
    eventName: 'Cinema Event 2026',
    eventDate: '2026-03-15',
    ticketPrice: '250 EGP'
  },
  {
    bookingId: 'RT-ABC123',
    guestName: 'أحمد',
    ticketType: 'vip',
    row: 'A',
    seatNumber: 2,
    eventName: 'Cinema Event 2026',
    eventDate: '2026-03-15',
    ticketPrice: '250 EGP'
  }
]);
// ينزل ملفات: Ticket-RT-ABC123-A1.png, Ticket-RT-ABC123-A2.png
```

---

### 3. Supabase Client (`src/app/services/supabase-client.ts`)

```typescript
import { supabase } from './services/supabase-client';

// استخدام Supabase مباشرة
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('status', 'completed');
```

---

## أنواع البيانات

### Seat
```typescript
interface Seat {
  id: string;
  theater_type: 'vip' | 'classic';
  row: string;
  seat_number: number;
  is_available: boolean;
  created_at: string;
}
```

### BookingData
```typescript
interface BookingData {
  name: string;
  phone: string;
  email?: string;
  theater_type: 'vip' | 'classic';
  seats: Array<{ row: string; seat_number: number }>;
  payment_method: string;
  receipt_url?: string;
  status: 'pending' | 'completed' | 'cancelled';
}
```

### TicketInfo
```typescript
interface TicketInfo {
  bookingId: string;
  guestName: string;
  ticketType: 'vip' | 'classic';
  row: string;
  seatNumber: number;
  eventName: string;
  eventDate: string;
  ticketPrice: string;
}
```

---

## أمثلة الاستخدام

### مثال 1: حجز VIP كامل

```typescript
import { getAvailableSeats, createBooking } from '@/services/booking-service';
import { downloadMultipleTickets } from '@/services/ticket-generator';

// 1. الحصول على المقاعد المتاحة
const availableVipSeats = await getAvailableSeats('vip');

// 2. اختيار مقعدين
const selectedSeats = [
  { row: 'A', seat_number: 1 },
  { row: 'A', seat_number: 2 }
];

// 3. إنشاء الحجز
const bookingId = await createBooking({
  name: 'أحمد محمد',
  phone: '201012345678',
  email: 'ahmed@example.com',
  theater_type: 'vip',
  seats: selectedSeats,
  payment_method: 'vodafone',
  receipt_url: 'https://example.com/receipt.jpg',
  status: 'completed'
});

// 4. تحميل التذاكر
const ticketsInfo = selectedSeats.map(seat => ({
  bookingId,
  guestName: 'أحمد محمد',
  ticketType: 'vip',
  row: seat.row,
  seatNumber: seat.seat_number,
  eventName: 'Cinema Event 2026',
  eventDate: '2026-03-15',
  ticketPrice: '250 EGP'
}));

await downloadMultipleTickets(ticketsInfo);
```

### مثال 2: التحقق من المقاعد المتاحة

```typescript
import { getBookedSeats, getSeatLayout } from '@/services/booking-service';

// الحصول على المقاعد المحجوزة
const bookedSet = await getBookedSeats('classic');

// الحصول على التخطيط
const layout = await getSeatLayout('classic');

// حساب العدد المتاح
let totalAvailable = 0;
for (const [row, count] of Object.entries(layout)) {
  for (let i = 1; i <= count; i++) {
    if (!bookedSet.has(`${row}-${i}`)) {
      totalAvailable++;
    }
  }
}

console.log(`عدد المقاعد المتاحة: ${totalAvailable}`);
```

### مثال 3: استعلام مباشر Supabase

```typescript
import { supabase } from '@/services/supabase-client';

// احصل على جميع الحجوزات
const { data: bookings } = await supabase
  .from('bookings')
  .select('*, booking_seats(*)')
  .eq('status', 'completed');

// احصل على حجز محدد
const { data: booking } = await supabase
  .from('bookings')
  .select('*')
  .eq('booking_id', 'RT-ABC123')
  .single();

// احصل على مقاعد حجز محدد
const { data: seats } = await supabase
  .from('booking_seats')
  .select('*, theater_seats(*)')
  .eq('booking_id', bookingId);
```

---

## معالجة الأخطاء

```typescript
try {
  const seats = await getAvailableSeats('vip');
} catch (error) {
  console.error('[v0] Failed to fetch seats:', error);
  // إظهار رسالة خطأ للمستخدم
  toast.error('فشل تحميل المقاعد. حاول لاحقاً.');
}
```

---

## متغيرات البيئة

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## رموز الخطأ الشائعة

| الرمز | السبب | الحل |
|------|------|-----|
| 401 | عدم المصادقة | تحقق من مفاتيح Supabase |
| 403 | عدم الإذن | تحقق من RLS policies |
| 404 | غير موجود | تحقق من UUID |
| 409 | تعارض | المقعد محجوز بالفعل |
| 500 | خطأ الخادم | أعد المحاولة لاحقاً |

---

## الأداء الأمثل

```typescript
// ✅ استخدم Promise.all للعمليات المتوازية
const [seats, layout, booked] = await Promise.all([
  getAvailableSeats('vip'),
  getSeatLayout('vip'),
  getBookedSeats('vip')
]);

// ❌ لا تستخدم العمليات المتسلسلة
// const seats = await getAvailableSeats('vip');
// const layout = await getSeatLayout('vip');
// const booked = await getBookedSeats('vip');
```

---

## الأمان

- جميع البيانات مشفرة في النقل (SSL/TLS)
- RLS Policies تحمي الصفوف
- Validation على كل مدخل
- معرفات فريدة UUID لكل حجز

---

جميع الوثائق آخر تحديث: 2026-02-28
