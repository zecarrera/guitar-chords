import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Vercel Hobby caps request bodies at ~4.5 MB at the infrastructure level;
      // PDFs larger than that will be rejected before reaching the app.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
