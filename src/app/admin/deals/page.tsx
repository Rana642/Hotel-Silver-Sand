import { redirect } from "next/navigation";

// Deals were merged into Promotions — a promotion with a discount % + date range
// now acts as an automatic deal. This route just forwards there.
export default function DealsPage() {
  redirect("/admin/promotions");
}
