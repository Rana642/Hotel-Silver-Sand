import NotificationSettings from "@/components/admin/NotificationSettings";
import HeroImagesEditor, { type HeroImg } from "@/components/admin/HeroImagesEditor";
import { getNotifyEmail } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [recipient, { data: hero }] = await Promise.all([
    getNotifyEmail(),
    supabase.from("hero_images").select("id, url, alt, is_active, sort_order").order("sort_order"),
  ]);
  const key = process.env.RESEND_API_KEY ?? "";
  const from = process.env.RESEND_FROM ?? null;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-heading text-2xl font-bold text-navy">Email Notifications</h1>
        <p className="mt-1 text-sm text-slate">
          When a guest submits a booking or inquiry, a summary email is sent to the address below. Guests
          with an email also receive a confirmation.
        </p>
        <div className="mt-6 max-w-2xl">
          <NotificationSettings current={recipient} keyConfigured={Boolean(key)} keyHint={key ? key.slice(-4) : ""} from={from} />
        </div>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-navy">Hero Slider Images</h2>
        <p className="mt-1 text-sm text-slate">These images auto-rotate in the homepage hero.</p>
        <div className="mt-6">
          <HeroImagesEditor images={(hero ?? []) as HeroImg[]} />
        </div>
      </section>
    </div>
  );
}
