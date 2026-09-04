import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { getRoomsStatic } from "@/lib/rooms";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/rooms", priority: 0.9, freq: "weekly" },
    { path: "/reservations", priority: 0.9, freq: "daily" },
    { path: "/promotions", priority: 0.8, freq: "weekly" },
    { path: "/facilities", priority: 0.7, freq: "monthly" },
    { path: "/discover-multan", priority: 0.7, freq: "monthly" },
    { path: "/gallery", priority: 0.6, freq: "monthly" },
    { path: "/about", priority: 0.6, freq: "monthly" },
    { path: "/faq", priority: 0.7, freq: "monthly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
  ];

  // Room detail pages carry the "hotel room in Multan" long-tail — keep them indexed.
  let roomPaths: string[] = [];
  try {
    const rooms = await getRoomsStatic();
    roomPaths = rooms.map((r) => `/rooms/${r.slug}`);
  } catch {
    roomPaths = [];
  }

  return [
    ...routes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: now,
      changeFrequency: r.freq,
      priority: r.priority,
    })),
    ...roomPaths.map((path) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
