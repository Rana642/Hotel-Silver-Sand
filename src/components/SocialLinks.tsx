import { Facebook, Instagram, Youtube, TikTok, Linkedin } from "@/components/BrandIcons";
import { site } from "@/data/site";

const items = [
  { label: "Facebook", href: site.social.facebook, Icon: Facebook },
  { label: "Instagram", href: site.social.instagram, Icon: Instagram },
  { label: "YouTube", href: site.social.youtube, Icon: Youtube },
  { label: "TikTok", href: site.social.tiktok, Icon: TikTok },
  { label: "LinkedIn", href: site.social.linkedin, Icon: Linkedin },
];

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {items.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-gold hover:text-navy-dark"
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}
