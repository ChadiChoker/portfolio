import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    // The model and CV change rarely: cache a week, revalidate in the background.
    const week = "public, max-age=604800, stale-while-revalidate=86400";
    return [
      { source: "/models/:file*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/Chadi_Choker_CV.pdf", headers: [{ key: "Cache-Control", value: week }] },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
