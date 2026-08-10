# Hotel Silver Sand Multan — Website

Production website for Hotel Silver Sand Multan, built with **Next.js 16 (App Router)**,
**React 19**, **TypeScript** and **Tailwind CSS v4**. Frontend-only booking flow via
WhatsApp/phone — no backend or online payments.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

## Pages

`/` · `/rooms` · `/facilities` · `/discover-multan` · `/gallery` · `/about` · `/contact`

## Before going live — replace placeholders

1. **Real photos** — the images in `public/images/**` are branded SVG placeholders.
   Drop in real hotel photos using the **same file paths** (you can switch the
   extensions to `.jpg`/`.webp` and update the `image`/`src` fields in `src/data/*`).
   Keep `next/image` `alt` text meaningful.
2. **Social links** — set real profile URLs in `src/data/site.ts` → `social`.
3. **Booking.com** — set the real property URL in `src/data/site.ts` →
   `bookingDotComUrl`. While empty, "Book on Booking.com" buttons fall back to WhatsApp.
4. **YouTube / videos** — set `youtubeChannel` and add real embeds to `videos` in
   `src/data/gallery.ts`.
5. **Google Maps** — `mapEmbed` / `mapDirections` in `site.ts` use the postal address.
   Swap for the hotel's exact Google Maps place URL if you have it.
6. **Map coordinates** — `hotelSchema.geo` in `src/lib/seo.ts` uses approximate
   Multan coordinates; set the exact lat/long for accurate local SEO.

## Where things live

- `src/data/` — all editable content (rooms, amenities, gallery, destinations, reviews, site info)
- `src/components/` — reusable UI (Header, Footer, BookingModal, RoomCard, GalleryGrid, …)
- `src/lib/seo.ts` — metadata helper + JSON-LD (Hotel, WebSite, HotelRoom schemas)
- `src/app/*/page.tsx` — one file per route, each with its own SEO metadata

## Booking flow

All "Book Now / Book Direct" actions open a validated modal. On submit it builds a
prefilled WhatsApp message to **+92 300 872 0939** (`wa.me`). No server or database.
