"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, Inbox, BedDouble, CalendarRange,
  BarChart3, ScrollText, Tag, LogOut, ExternalLink, MoreHorizontal, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const primary = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarRange },
];
const secondary = [
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity Log", icon: ScrollText },
];
const allNav = [...primary.slice(0, 3), secondary[0], primary[3], ...secondary.slice(1)];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIn, setSheetIn] = useState(false);

  useEffect(() => {
    if (sheetOpen) {
      const t = setTimeout(() => setSheetIn(true), 10);
      return () => clearTimeout(t);
    }
    setSheetIn(false);
  }, [sheetOpen]);

  if (pathname === "/admin/login") return <>{children}</>;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const title = allNav.find((n) => isActive(n.href))?.label ?? "Admin";

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
          {allNav.map(({ href, label, icon: Icon }) => (
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
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
            <ExternalLink className="size-5" /> View Website
          </a>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10">
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
        <a href="/" target="_blank" rel="noopener noreferrer" aria-label="View website" className="text-white/80">
          <ExternalLink className="size-5" />
        </a>
      </header>

      {/* Content */}
      <main className="mt-14 px-4 pb-24 pt-4 print:m-0 print:p-0 lg:ml-60 lg:mt-0 lg:p-8">{children}</main>

      {/* Mobile bottom tabs */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-gray-200 bg-white print:hidden lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {primary.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${isActive(href) ? "text-gold" : "text-navy/60"}`}
          >
            <Icon className={`size-5 ${isActive(href) ? "stroke-[2.5]" : ""}`} /> {label}
          </Link>
        ))}
        <button
          onClick={() => setSheetOpen(true)}
          className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium ${secondary.some((s) => isActive(s.href)) ? "text-gold" : "text-navy/60"}`}
        >
          <MoreHorizontal className="size-5" /> More
        </button>
      </nav>

      {/* Mobile More sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${sheetIn ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSheetOpen(false)}
          />
          <div
            className={`absolute inset-x-0 bottom-0 rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] transition-transform ${sheetIn ? "translate-y-0" : "translate-y-full"}`}
          >
            <div className="flex items-center justify-between px-5 py-3">
              <div className="mx-auto h-1 w-10 rounded-full bg-gray-300" />
              <button onClick={() => setSheetOpen(false)} aria-label="Close" className="absolute right-4 text-slate">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 px-4 pb-3">
              {secondary.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSheetOpen(false)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-xs font-medium ${
                    isActive(href) ? "border-gold bg-gold/10 text-navy" : "border-gray-200 text-navy/70"
                  }`}
                >
                  <Icon className="size-6" /> {label}
                </Link>
              ))}
            </div>
            <div className="border-t border-gray-100 p-3">
              <button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut className="size-5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
