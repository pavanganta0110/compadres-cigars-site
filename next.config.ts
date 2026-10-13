import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: { qualities: [75, 90] },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // URLs from the GoDaddy site
      { source: "/home", destination: "/", permanent: true },
      { source: "/contact-us", destination: "/contact-us-1", permanent: true },
    ];
  },
};

export default nextConfig;
