"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, Contact, BedDouble, CalendarRange,
  BarChart3, ScrollText, Tag, Images, MapPin, Megaphone, Settings, LogOut, ExternalLink, MoreHorizontal, X,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const primary = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/contacts", label: "Contact", icon: Contact },
  { href: "/admin/availability", label: "Availability", icon: CalendarRange },
];
const secondary = [
  { href: "/admin/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/discover", label: "Discover", icon: MapPin },
  { href: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity Log", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];
const allNav = [...primary.slice(0, 3), secondary[0], primary[3], ...secondary.slice(1)];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIn, setSheetIn] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("hss_admin_collapsed") === "1");
    } catch {}
  }, []);
  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const n = !c;
      try {
        localStorage.setItem("hss_admin_collapsed", n ? "1" : "0");
      } catch {}
      return n;
    });

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
      {/* Desktop sidebar — glassy + collapsible */}
      <aside
        className={`fixed inset-y-0 left-0 hidden flex-col border-r border-white/10 bg-navy-dark/80 backdrop-blur-md transition-all duration-200 print:hidden lg:flex ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <div className={`flex items-center gap-3 border-b border-white/10 py-4 ${collapsed ? "justify-center px-2" : "px-5"}`}>
          <Image src="/images/logo-transparent.png" alt="" width={36} height={36} className="size-9 shrink-0 rounded-full" />
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">Admin Panel</p>
              <p className="truncate text-sm font-bold text-white">Silver Sand</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={toggleCollapsed} aria-label="Collapse sidebar" className="text-white/60 hover:text-gold">
              <PanelLeftClose className="size-5" />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={toggleCollapsed} aria-label="Expand sidebar" className="mx-auto mt-2 text-white/60 hover:text-gold">
            <PanelLeftOpen className="size-5" />
          </button>
        )}

        <nav className="flex-1 space-y-1 p-3">
          {allNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-md py-2.5 text-sm font-medium transition ${
                collapsed ? "justify-center px-2" : "px-3"
              } ${isActive(href) ? "bg-gold text-navy-dark" : "text-white/80 hover:bg-white/10"}`}
            >
              <Icon className="size-5 shrink-0" /> {!collapsed && label}
            </Link>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 p-3">
          <a href="/" target="_blank" rel="noopener noreferrer" title={collapsed ? "View Website" : undefined} className={`flex items-center gap-3 rounded-md py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 ${collapsed ? "justify-center px-2" : "px-3"}`}>
            <ExternalLink className="size-5 shrink-0" /> {!collapsed && "View Website"}
          </a>
          <button onClick={signOut} title={collapsed ? "Sign Out" : undefined} className={`flex w-full items-center gap-3 rounded-md py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 ${collapsed ? "justify-center px-2" : "px-3"}`}>
            <LogOut className="size-5 shrink-0" /> {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Mobile top header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-navy-dark/85 px-4 backdrop-blur-md print:hidden lg:hidden">
        <div className="flex items-center gap-2">
          <Image src="/images/logo-transparent.png" alt="" width={28} height={28} className="size-7 rounded-full" />
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
      <main className={`mt-14 px-4 pb-24 pt-4 transition-all duration-200 print:m-0 print:p-0 lg:mt-0 lg:p-8 ${collapsed ? "lg:ml-[68px]" : "lg:ml-60"}`}>{children}</main>

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
