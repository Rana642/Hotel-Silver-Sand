"use client";

import { trackEvent, type EventName } from "@/lib/analytics";
import { buttonClasses, type Variant } from "@/components/Button";

/** Client-side <a> that fires a GTM event on click. Used for external / tel: / mailto: links. */
export default function TrackedLink({
  href,
  event,
  params,
  variant,
  className = "",
  external,
  children,
}: {
  href: string;
  event: EventName;
  params?: Record<string, unknown>;
  variant?: Variant;
  className?: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const cls = variant ? buttonClasses(variant, className) : className;
  const openNewTab = external || href.startsWith("http");
  return (
    <a
      href={href}
      className={cls}
      onClick={() => trackEvent(event, params)}
      {...(openNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
