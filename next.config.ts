import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    // Room photos are already modest-resolution, so the optimiser's default
    // quality of 75 is a second round of loss on top of the source JPEG.
    // 90 is available for the photos that are actually looked at closely.
    qualities: [75, 90],
    // Optimised images are kept for 31 days instead of 60 seconds, so the optimiser is not asked to redo them.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "qjarifqmmfeggmkrxmbm.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;

// Lets the Cloudflare bindings work in `next dev` (no effect on Vercel or a normal build).
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
