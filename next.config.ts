import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // Pin the root to this folder; there is another lockfile in a parent folder on the dev machine
  outputFileTracingRoot: __dirname,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Product photos from the public Supabase Storage bucket
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/**`)] : [],
  },
  experimental: {
    serverActions: {
      // Up to 3 photos x 2 MB per product, plus headroom for the form data
      bodySizeLimit: "7mb",
    },
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
