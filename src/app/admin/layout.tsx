"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarCheck, Inbox, BedDouble, CalendarRange, LogOut, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarRange },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const title = navItems.find((n) => isActive(n.href))?.label ?? "Admin";

  return (
    <div className="min-h-dvh bg-cream">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-gray-200 bg-navy print:hidden lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Image src="/images/logo.svg" alt="" width={36} height={36} className="size-9 rounded-full" />
          <div className="leading-tight">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold">Admin Panel</p>
            <p className="text-sm font-bold text-white">Silver Sand</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                isActive(href) ? "bg-gold text-navy-dark" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <Icon className="size-5" /> {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            <ExternalLink className="size-5" /> View Website
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            <LogOut className="size-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-navy px-4 print:hidden lg:hidden">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.svg" alt="" width={28} height={28} className="size-7 rounded-full" />
          <div className="leading-none">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gold">Admin Panel</p>
            <p className="text-sm font-bold text-white">{title}</p>
          </div>
        </div>
        <button onClick={signOut} aria-label="Sign out" className="text-white/80">
          <LogOut className="size-5" />
        </button>
      </header>

      {/* Content */}
      <main className="mt-14 px-4 pb-24 pt-4 print:m-0 print:p-0 lg:ml-60 lg:mt-0 lg:p-8">{children}</main>

      {/* Mobile bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-gray-200 bg-white print:hidden lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
              isActive(href) ? "text-gold" : "text-navy/60"
            }`}
          >
            <Icon className={`size-5 ${isActive(href) ? "stroke-[2.5]" : ""}`} /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
