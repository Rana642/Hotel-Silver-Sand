# Hotel Silver Sand Multan — Booking.com Knowledge Base

Scraped from the live Booking.com listing on 2026-09-04.
Source: https://www.booking.com/hotel/pk/silver-sand-multan-multan.en-gb.html

This is **verified third-party data**. Where it conflicts with the website, the
conflict is flagged — those need the owner's decision, not a silent overwrite.

---

## Identity & rating

| Field | Value |
|---|---|
| Name | Hotel Silver Sand Multan |
| Star rating | **2-star** accommodation |
| Guest score | **6.2 / 10 — "Pleasant"** |
| Review count | **19 reviews** |
| Address (Booking.com) | 514 Akbar Rd, 60000 Multan, Punjab, Pakistan |
| Photos on listing | 190+ |
| Payment accepted | **Cash** |

### Review sub-scores (real)
| Category | Score |
|---|---|
| Free WiFi | **10** |
| Staff | **8.1** |
| Location | 7.5 |
| Cleanliness | 7.4 |
| Comfort | 7.2 |
| Value for money | 7.0 |
| Facilities | 6.8 |

**Marketing read:** WiFi (10) and Staff (8.1) are the genuine strengths — lead with
those. Facilities (6.8) is the weakest; don't over-promise on facilities.

---

## Official Booking.com description (verbatim)

> **Comfortable Accommodations:** Hotel Silver Sand Multan in Multan offers family
> rooms with private bathrooms, balconies, and terraces. Each room includes a
> refrigerator, TV, and soundproofing for a pleasant stay.
>
> **Essential Facilities:** Guests enjoy a garden, terrace, and free WiFi. Additional
> amenities include a minimarket, outdoor seating area, and free on-site private parking.
>
> **Convenient Services:** The hotel provides private check-in and check-out, a
> 24-hour front desk, concierge service, and room service. Special diet menus and
> walking tours are available.
>
> **Prime Location:** Located 3 km from Multan International Airport.

---

## Distances (OpenStreetMap-calculated, authoritative)

| Place | Distance |
|---|---|
| **Multan Cantt Railway Station** | **500 m** (walking) |
| **Multan International Airport** | **2.4 km** |
| City Railway Station | 3.8 km |
| Babar Murg Plao (cafe/restaurant) | 700 m |
| Lodhi Burger Point | 5 km |
| Rasheed Drink Corner | 6 km |

> ⚠️ Website currently says "8 minutes from Multan Airport". 2.4 km is consistent with
> ~8 min by car, so that claim is fine — but **"500 m from Multan Cantt Railway Station"
> is a much stronger, unused selling point.**

---

## Facilities (real, per Booking.com)

**Most popular:** Free WiFi · Free parking · Airport shuttle · Room service ·
Facilities for disabled guests · Non-smoking rooms · Family rooms

**Also listed:** Garden · Terrace · Minimarket · Outdoor seating area ·
Free on-site **private** parking · Private check-in/check-out · 24-hour front desk ·
Concierge service · Special diet menus · Walking tours

**In-room:** Private bathroom · Balcony · Terrace · Refrigerator · TV · **Soundproofing**

> ⚠️ Website is **missing** these real amenities: garden, terrace, balconies,
> soundproofing, minimarket, outdoor seating, airport shuttle, concierge,
> disabled-guest facilities, non-smoking rooms, private check-in/check-out.

---

## Room types on Booking.com

Rates scraped with live dates (check-in 2026-09-15, 1 night, 2 adults).

| Room | Rate / night | Taxes & charges | Size | Beds | Sleeps |
|---|---|---|---|---|---|
| Deluxe King Room | **PKR 3,000** | + PKR 780 | 15 m² (161 sq ft) | 1 extra-large double bed | 2 |
| Deluxe Double Room | PKR 6,250 | + PKR 1,625 | — (high floor) | 1 large double bed | 2 |
| Deluxe Triple Room | PKR 6,250 | + PKR 1,625 | 17 m² (183 sq ft) | 1 single + 1 double bed | 3 |
| Budget Twin Room | PKR 6,250 | + PKR 1,625 | — | 2 single beds | 2 |

Policy on every room: *Free cancellation · No prepayment needed — pay at the property.*
No struck-through "was" price is shown, so the site can no longer claim a "Save X%" discount
off a list rate.

> ✅ **RESOLVED (2026-09-04).** Booking.com is now the single source of truth. The database
> and `src/data/rooms.ts` were synced by `scripts/sync-rooms-from-booking.mjs`:
> *Executive Twin Room* → **Deluxe Double Room**, *Executive Family Room* → **Budget Twin Room**,
> slugs renamed to match, rates set to 3,000 / 6,250, and all `original_price` cleared.

> ⚠️ **OPEN — needs owner decision.** Booking.com adds **26 % "taxes and charges"**
> (PKR 780 on 3,000; PKR 1,625 on 6,250). The website charges **16 % GST**. That 10-point
> gap is probably Booking.com's own commission/service fee folded into the displayed total,
> which would *not* apply to a direct booking — but it is a financial figure, so it has not
> been changed. Confirm with the owner before touching `gst_percent`.

---

## House rules (real)

| Rule | Value |
|---|---|
| Check-in | **Available 24 hours** |
| Check-out | **12:00 – 13:00** |
| Children | Any age welcome; **3 years and above charged as adults** |
| Extra bed (0–12 yrs) | **PKR 1,000 per child, per night** (paid at property) |
| Cots | **None available** |
| Pets | **Not allowed** |
| Parties/events | **Not allowed** |
| Age restriction | None for check-in |
| Payment | **Cash** |

> ⚠️ Website does not state check-out time, extra-bed charge, pet policy or
> cash-only payment. These are exactly the questions guests ask before booking.

---

## Questions guests actually ask (from the listing's FAQ module)

These are real demand signals — each is a content/FAQ opportunity:

1. Do they serve **breakfast**?
2. Is there an **airport shuttle** service?
3. Is there a **restaurant**?
4. Can I **park** there?
5. Is there a **swimming pool**?
6. What restaurants, attractions and **public transport** are nearby?
7. What are the **check-in / check-out times**?
8. Are there rooms with a **private bathroom**?
9. Are there rooms with a **balcony**?
10. Is there a **spa**?
11. How far is the hotel from the **centre of Multan**?
12. Is it **popular with families**?

> Answering these on-site (FAQ schema) targets long-tail search directly.

---

## Gaps / open questions for the owner

1. **Room names** — reconcile website vs Booking.com (see conflict above).
2. **Breakfast** — is it served? Booking.com FAQ asks; website's Long Stay promo
   mentions perks but breakfast is never confirmed.
3. **Airport shuttle** — listed on Booking.com as a facility. Free or paid?
   Website says "Pick-up & drop service (chargeable)" — confirm and align.
4. **Restaurant / pool / spa** — Booking.com does not list these; assume none.
   Website should say so plainly to avoid mismatched expectations.
5. **Star rating** — Booking.com classifies it as **2-star**. Website tone reads more
   premium; keep claims honest.
