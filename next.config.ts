import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Argon2 is a native module that should only run on the server
  // serverExternalPackages tells Next.js/Turbopack not to bundle this package
  serverExternalPackages: ["argon2"],
  // Empty turbopack config to silence the warning (Next.js 16 uses Turbopack by default)
  turbopack: {},
};

export default nextConfig;
