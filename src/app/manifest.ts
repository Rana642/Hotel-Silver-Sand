import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Silver Sand",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0b2b4b",
    theme_color: "#0b2b4b",
    icons: [{ src: "/images/logo-transparent.png", sizes: "any", type: "image/png" }],
  };
}
