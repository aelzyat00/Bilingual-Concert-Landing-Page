# روح الطرب — Rooh Al-Tarab Concert Landing Page

---

## Quick Start

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

## Deploy to Vercel (Free)

1. Push this folder to a GitHub repo
2. Go to vercel.com → Import Project → Deploy
3. Done ✅  (Framework: Vite, Build: `npm run build`, Output: `dist`)

---

## 🔴 MUST Change Before Going Live

1. **Payment numbers** in `src/app/components/booking-flow.tsx`
   - Vodafone Cash: `'01012345678'`
   - InstaPay: `'roohaltarab@instapay'`

2. **Logo**: Replace `src/assets/logo.png` with your actual logo

3. **Ticket prices**: In `tickets-section.tsx` → `classicPrice` and `vipPrice`

4. **OG image** in `index.html` for social sharing preview

---

## Fixes Applied from Figma Export

| Issue | Fix Applied |
|-------|------------|
| `figma:asset/...` broken imports | Replaced with `@/assets/logo.png` |
| No form validation | Phone/email/name validation with RTL error messages |
| No scroll lock on modal | `body.overflow = hidden` when modal opens |
| Default language was English | Changed default to Arabic |
| HTML dir not synced | useEffect syncs `document.documentElement.dir` |
| No SEO meta tags | Full OG + Twitter Card + canonical added |
| No accessibility labels | role, aria-label, aria-modal throughout |
| No drag & drop for receipt | Full drag/drop with visual states |
| No file size check | 10MB limit enforced |
| No TypeScript image types | declarations.d.ts added |
| No Vercel config | vercel.json with SPA rewrites + security headers |
| Booking ID weak | Now: RT-[timestamp36]-[random] |
| VIP button text invisible | Fixed to `text-[#0A0A0A]` (dark on gold) |
