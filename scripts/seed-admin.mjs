// Grant admin access to a Supabase auth user.
// 1. Create the user first in Supabase > Authentication > Users > Add user
//    (set a password, tick "Auto Confirm User").
// 2. Run:  node scripts/seed-admin.mjs your@email.com
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {}
}
loadEnv();

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/seed-admin.mjs your@email.com");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

// find the auth user by email (paginate to be safe)
let user = null;
for (let page = 1; page <= 20 && !user; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("Failed to list users:", error.message);
    process.exit(1);
  }
  user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (data.users.length < 200) break;
}

if (!user) {
  console.error(`No auth user found with email ${email}. Create it first in Supabase > Authentication > Users.`);
  process.exit(1);
}

const { error } = await supabase
  .from("admin_users")
  .upsert({ id: user.id, email: user.email }, { onConflict: "id" });

if (error) {
  console.error("Failed to insert admin_users:", error.message);
  process.exit(1);
}

console.log(`✓ ${email} is now an admin (id ${user.id}).`);
