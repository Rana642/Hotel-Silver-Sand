"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/Button";
import { nav, site } from "@/data/site";
import { useBooking } from "@/components/BookingProvider";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const booking = useBooking();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="container-site flex h-[70px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-sm font-medium transition after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:bg-gold after:transition-all hover:text-gold ${
                isActive(item.href)
                  ? "text-gold after:w-full"
                  : "text-navy after:w-0 hover:after:w-full"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 xl:flex">
          <button
            type="button"
            onClick={() => booking.openContact("call")}
            className="flex items-center gap-2 text-sm font-semibold text-navy hover:text-gold"
          >
            <Phone className="size-4 text-gold" />
            {site.phone}
          </button>
          <Button variant="gold" onClick={() => booking.open()} className="px-5 py-2.5">
            Book Now
          </Button>
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center rounded-md text-navy xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 top-[70px] z-40 bg-black/40 transition-opacity xl:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <nav
        className={`fixed right-0 top-[70px] z-40 h-[calc(100dvh-70px)] w-[min(85vw,320px)] overflow-y-auto bg-white shadow-pop transition-transform xl:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile"
      >
        <ul className="flex flex-col p-4">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-4 py-3 text-base font-medium ${
                  isActive(item.href) ? "bg-cream text-gold" : "text-navy hover:bg-cream"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3 border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              booking.openContact("call");
            }}
            className="flex items-center justify-center gap-2 rounded-md border border-navy/20 px-4 py-3 font-semibold text-navy"
          >
            <Phone className="size-4 text-gold" /> {site.phone}
          </button>
          <Button
            variant="gold"
            onClick={() => {
              setOpen(false);
              booking.open();
            }}
          >
            Book Now
          </Button>
        </div>
      </nav>
    </header>
  );
}
