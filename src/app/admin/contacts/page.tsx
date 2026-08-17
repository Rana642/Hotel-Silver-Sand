import ContactsTable from "@/components/admin/ContactsTable";
import { getContacts } from "@/lib/contacts";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Contacts</h1>
      <p className="mt-1 text-sm text-slate">
        Every guest who books is added here automatically — name, phone and email — so you always have
        their details for follow-up.
      </p>
      <div className="mt-6">
        <ContactsTable contacts={contacts} />
      </div>
    </div>
  );
}
