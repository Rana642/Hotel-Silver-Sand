"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { buttonClasses } from "@/components/Button";
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
    <>
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/80 shadow-sm backdrop-blur-md">
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

          <div className="hidden flex-col items-stretch gap-1.5 xl:flex">
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => booking.openContact("call")}
                className="flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-gold"
              >
                <Phone className="size-4 text-gold" />
                {site.phone}
              </button>
              <span className="h-4 w-px bg-gray-300" aria-hidden="true" />
              <button
                type="button"
                onClick={() => booking.openContact("whatsapp")}
                aria-label="WhatsApp us"
                className="flex size-6 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:brightness-95"
              >
                <MessageCircle className="size-3.5" />
              </button>
            </div>
            <Link href="/rooms" className={buttonClasses("gold", "w-full justify-center py-1.5 text-sm")}>
              Book Now
            </Link>
          </div>

          <button
            type="button"
            className="flex size-11 items-center justify-center text-navy xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer — rendered OUTSIDE <header> so the header's backdrop-blur
          doesn't become the containing block for this fixed element. */}
      <div
        className={`fixed inset-x-0 bottom-0 top-[70px] z-[60] overflow-hidden xl:hidden ${
          open ? "" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <nav
          style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}
          className="absolute right-0 top-0 h-full w-[min(85vw,320px)] overflow-y-auto bg-white shadow-pop transition-transform duration-300"
          aria-label="Mobile"
        >
          <ul className="flex flex-col p-4">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 text-base font-medium ${
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
              className="flex items-center justify-center gap-2 border border-navy/20 px-4 py-3 font-semibold text-navy"
            >
              <Phone className="size-4 text-gold" /> {site.phone}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                booking.openContact("whatsapp");
              }}
              className="flex items-center justify-center gap-2 bg-[#25D366] px-4 py-3 font-semibold text-white"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </button>
            <Link href="/rooms" onClick={() => setOpen(false)} className={buttonClasses("gold")}>
              Book Now
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
