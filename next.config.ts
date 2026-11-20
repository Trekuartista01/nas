import type { NextConfig } from "next";
import { securityHeaders } from "./security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Don't advertise the framework in an `X-Powered-By` header.
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // The site forms are a few short text fields. Default is 1MB; a small cap limits abuse.
      // (Admin image uploads in Milestone 4 go straight to Supabase Storage, not through actions.)
      bodySizeLimit: "64kb",
    },
  },
  // /servisi was removed (Nov 2026): old links and bookmarks land on the models page,
  // where each model has its own test-ride form. Temporary, in case the page comes back.
  async redirects() {
    return [{ source: "/servisi", destination: "/modelet", permanent: false }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
