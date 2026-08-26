import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Example app is consumed standalone; skip monorepo ESLint during `next build`.
    ignoreDuringBuilds: true
  },
  transpilePackages: [
    '@cos-design/weather-background',
    '@cos-design/neon-text',
    '@cos-design/scratch-card',
    '@cos-design/fireworks',
    '@cos-design/shared'
  ]
};

export default nextConfig;
