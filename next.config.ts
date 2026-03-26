import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // On Vercel we must keep the default ".next" folder.
  // Locally, we use a different dist dir to avoid Windows file-lock issues.
  distDir: process.env.VERCEL ? undefined : ".next-local",
};

export default withPWA(nextConfig);
