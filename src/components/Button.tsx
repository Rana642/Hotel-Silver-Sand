import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "gold" | "navy" | "outline" | "outline-light" | "whatsapp";

const variants: Record<Variant, string> = {
  gold: "bg-gold text-navy-dark hover:brightness-95",
  navy: "bg-navy text-white hover:bg-navy-dark",
  outline: "border border-navy/20 text-navy hover:bg-navy hover:text-white",
  "outline-light": "border border-white/40 text-white hover:bg-white/10",
  whatsapp: "bg-[#25D366] text-white hover:brightness-95",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition min-h-[44px]";

type BaseProps = { variant?: Variant; className?: string; children: ReactNode };

export function ButtonLink({
  href,
  variant = "gold",
  className = "",
  children,
  external,
  ...rest
}: BaseProps & { href: string; external?: boolean } & Omit<
    ComponentProps<"a">,
    "href" | "className" | "children"
  >) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={cls}
        {...(external || href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "gold",
  className = "",
  children,
  ...rest
}: BaseProps & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
