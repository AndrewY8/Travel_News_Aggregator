import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "runway-media-production.global.ssl.fastly.net" },
      { hostname: "skift.com" },
      { hostname: "cdn.onemileatatime.com" },
      { hostname: "onemileatatime.com" },
      { hostname: "thepointsguy.com" },
    ],
  },
};

export default nextConfig;
