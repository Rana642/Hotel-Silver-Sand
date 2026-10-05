/**
 * Tax model — TAX-EXCLUSIVE, the Booking.com pattern (since 2026-10-05).
 *
 * `rooms.price_per_night` (offer) and `rooms.original_price` (standard) are
 * PRE-TAX — the standard equals the Booking.com extranet standard rate, the
 * offer is 20% below it. GST (`rooms.gst_percent`, 16% for direct bookings;
 * no city tax on the direct channel) is added on top at checkout as its own
 * line. `bookings.total` stores the amount payable (incl. GST).
 *
 * Rollout rule: DB prices and this code switch together — the old
 * GST-inclusive code with pre-tax prices would undercharge by 16%.
 */
export function addGst(amount: number, gstPercent: number) {
  const gst = gstPercent > 0 ? Math.round((amount * gstPercent) / 100) : 0;
  return { gst, total: amount + gst };
}
