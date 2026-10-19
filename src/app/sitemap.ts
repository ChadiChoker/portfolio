import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, priority: 1 }, ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, priority: 0.7 }))];
}
