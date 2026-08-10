import Link from "next/link";
import Image from "next/image";
import { site } from "@/data/site";

export default function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${site.name} home`}>
      <Image
        src="/images/logo.svg"
        alt={`${site.name} logo`}
        width={48}
        height={48}
        className="size-11 shrink-0 rounded-full"
      />
      <span className="leading-tight">
        <span
          className={`block font-heading text-[15px] font-bold tracking-tight ${
            dark ? "text-white" : "text-navy"
          }`}
        >
          HOTEL SILVER SAND MULTAN
        </span>
        <span className="block text-[10px] font-semibold tracking-[0.15em] text-gold">
          ESTABLISHED IN {site.established}
        </span>
      </span>
    </Link>
  );
}
