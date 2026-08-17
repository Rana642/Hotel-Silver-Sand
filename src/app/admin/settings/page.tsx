import NotificationSettings from "@/components/admin/NotificationSettings";
import { getNotifyEmail } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const recipient = await getNotifyEmail();
  const key = process.env.RESEND_API_KEY ?? "";
  const from = process.env.RESEND_FROM ?? null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Email Notifications</h1>
      <p className="mt-1 text-sm text-slate">
        When a guest submits a booking or inquiry, a summary email is sent to the address below. Guests
        with an email also receive a confirmation.
      </p>
      <div className="mt-6 max-w-2xl">
        <NotificationSettings
          current={recipient}
          keyConfigured={Boolean(key)}
          keyHint={key ? key.slice(-4) : ""}
          from={from}
        />
      </div>
    </div>
  );
}
