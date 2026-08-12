import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";
import { nav, site, tel } from "@/data/site";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-site grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Image
            src="/images/logo-transparent.png"
            alt={`${site.name} logo`}
            width={64}
            height={64}
            className="size-16 rounded-full border border-white/10"
          />
          <h2 className="mt-4 font-heading text-lg font-bold">HOTEL SILVER SAND MULTAN</h2>
          <p className="text-sm font-semibold tracking-[0.15em] text-gold">
            ESTABLISHED IN {site.established}
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            {site.description}
          </p>
          <SocialLinks className="mt-6" />
        </div>

        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gold">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-white/80 transition hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-gold">
            Contact Info
          </h3>
          <ul className="mt-4 space-y-4 text-sm text-white/80">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-gold" />
              <span>{site.address.full}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-gold" />
              <a href={tel} className="hover:text-gold">
                {site.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-gold" />
              <a href={`mailto:${site.email}`} className="break-all hover:text-gold">
                {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/contact" className="hover:text-gold">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-gold">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
